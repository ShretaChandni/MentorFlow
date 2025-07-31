
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { auth, firestore } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import { doc, writeBatch, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isReauthDialogOpen, setIsReauthDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentPasswordForDelete, setCurrentPasswordForDelete] = useState('');

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordChangeSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
    if (!user) return;
    setIsPasswordSubmitting(true);
    try {
      await updatePassword(user, data.newPassword);
      toast({ title: 'Success!', description: 'Your password has been updated.' });
      resetPasswordForm();
    } catch (error: any) {
      console.error('Password update error:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast({ variant: 'destructive', title: 'Action Required', description: 'This operation is sensitive and requires recent authentication. Please log out and log back in to change your password.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update your password.' });
      }
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !userData) return;
    setIsDeleteSubmitting(true);

    try {
        const credential = EmailAuthProvider.credential(user.email!, currentPasswordForDelete);
        await reauthenticateWithCredential(user, credential);

        const batch = writeBatch(firestore);

        // 1. Delete user's main profile document
        const userDocRef = doc(firestore, userData.role === 'mentor' ? 'mentors' : 'mentees', user.uid);
        batch.delete(userDocRef);

        // 2. Find all matches the user is part of
        const matchesAsMentorQuery = query(collection(firestore, 'matches'), where('mentorId', '==', user.uid));
        const matchesAsMenteeQuery = query(collection(firestore, 'matches'), where('menteeId', '==', user.uid));
        const [mentorMatches, menteeMatches] = await Promise.all([getDocs(matchesAsMentorQuery), getDocs(matchesAsMenteeQuery)]);
        const allMatches = [...mentorMatches.docs, ...menteeMatches.docs];

        for (const matchDoc of allMatches) {
             // 3. Delete all messages within each match's subcollection
            const messagesQuery = query(collection(matchDoc.ref, 'messages'));
            const messagesSnapshot = await getDocs(messagesQuery);
            messagesSnapshot.forEach(messageDoc => {
                batch.delete(messageDoc.ref);
            });
            // 4. Delete the match document itself
            batch.delete(matchDoc.ref);
        }

        // 5. Delete user's notifications
        const notificationsQuery = query(collection(firestore, 'notifications'), where('userId', '==', user.uid));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        notificationsSnapshot.forEach(notificationDoc => batch.delete(notificationDoc.ref));

        // Commit all Firestore deletions
        await batch.commit();

        // 6. Finally, delete the Firebase Auth user
        await deleteUser(user);

        toast({ title: 'Account Deleted', description: 'Your account and all associated data have been permanently removed.' });
        router.push('/');

    } catch (error: any) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            toast({ variant: 'destructive', title: 'Incorrect Password', description: 'The password you entered is incorrect.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete your account. Please try again.' });
            console.error('Account deletion error:', error);
        }
    } finally {
        setIsDeleteSubmitting(false);
        setIsReauthDialogOpen(false);
        setCurrentPasswordForDelete('');
    }
  };


  return (
    <>
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>
      <div className="grid gap-6">
        <Card className="shadow-lg shadow-primary/20">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password here. It's recommended to use a strong, unique password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit(onPasswordChangeSubmit)} className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...registerPassword('newPassword')} />
                {passwordErrors.newPassword && <p className="text-destructive text-sm mt-1">{passwordErrors.newPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" {...registerPassword('confirmPassword')} />
                {passwordErrors.confirmPassword && <p className="text-destructive text-sm mt-1">{passwordErrors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 shadow-lg shadow-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>This action is permanent and cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}>Delete Account</Button>
          </CardContent>
        </Card>
      </div>

       <AlertDialog open={isReauthDialogOpen} onOpenChange={setIsReauthDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Your Identity</AlertDialogTitle>
                  <AlertDialogDescription>
                      For your security, please enter your password to confirm you want to delete your account.
                  </AlertDialogDescription>
              </AlertDialogHeader>
               <div className="py-4 space-y-2">
                  <Label htmlFor="currentPasswordForDelete">Password</Label>
                  <Input 
                    id="currentPasswordForDelete" 
                    type="password" 
                    value={currentPasswordForDelete}
                    onChange={(e) => setCurrentPasswordForDelete(e.target.value)}
                    autoFocus
                  />
               </div>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCurrentPasswordForDelete('')}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleteSubmitting || !currentPasswordForDelete}>
                      {isDeleteSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete My Account
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including your profile, connections, and messages.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                 <AlertDialogAction asChild>
                    <Button onClick={() => { setIsDeleteConfirmOpen(false); setIsReauthDialogOpen(true); }}>Continue</Button>
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
