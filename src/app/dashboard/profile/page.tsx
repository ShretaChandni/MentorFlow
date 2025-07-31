
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { firestore } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

const mentorProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  professionalTitle: z.string().min(1, 'Professional title is required'),
  company: z.string().min(1, 'Company is required'),
  bio: z.string().min(1, 'Bio is required'),
  experience: z.string().min(1, 'Experience is required'),
  helpWith: z.string().min(1, 'This field is required'),
});

const menteeProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  currentRole: z.string().min(1, 'Current role is required'),
  goals: z.string().min(1, 'Goals are required'),
  interests: z.string().min(1, 'Interests are required'),
});

type MentorFormValues = z.infer<typeof mentorProfileSchema>;
type MenteeFormValues = z.infer<typeof menteeProfileSchema>;
type ProfileFormValues = MentorFormValues | MenteeFormValues;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, userData, loading: authLoading, refetchUserData } = useAuth();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const isMentor = userData?.role === 'mentor';
  const profileSchema = isMentor ? mentorProfileSchema : menteeProfileSchema;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (userData) {
      reset(userData);
      if (userData.profilePictureUrl) {
          setProfilePicture(userData.profilePictureUrl);
      }
    }
  }, [userData, reset]);

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const options = {
        maxSizeMB: 0.5, // (Max size in MB)
        maxWidthOrHeight: 300, // (Compressed new width or height)
        useWebWorker: true,
      };
      
      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePicture(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast({
          variant: 'destructive',
          title: 'Image Compression Error',
          description: 'Could not process the image. Please try a different one.',
        });
      }
    }
  };

  const onFormSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user || !userData) return;

    const collectionName = isMentor ? 'mentors' : 'mentees';
    const userDocRef = doc(firestore, collectionName, user.uid);

    const dataToUpdate: any = { ...data };
    if (profilePicture && profilePicture !== userData.profilePictureUrl) {
        dataToUpdate.profilePictureUrl = profilePicture;
    }

    try {
      await updateDoc(userDocRef, dataToUpdate);
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
      refetchUserData(); // Refetch data to update UI contextually
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update your profile. Please try again.',
      });
    }
  };

  if (authLoading) {
    return (
      <Card className="shadow-lg shadow-primary/20">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal and professional information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card className="shadow-lg shadow-primary/20">
        <CardHeader><CardTitle>Profile not found</CardTitle></CardHeader>
        <CardContent><p>Could not load user profile. Please try logging out and back in.</p></CardContent>
      </Card>
    );
  }
  
  const displayName = userData?.fullName || "User";
  const fallbackInitial = displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || "U";

  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl font-headline">Your Profile</CardTitle>
        <CardDescription>This is how your profile appears to others. Keep it up to date!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              className="hidden"
              accept="image/*"
            />
            <Avatar className="w-32 h-32 border-4 border-primary/20 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <AvatarImage src={profilePicture ?? undefined} alt="Profile picture" />
              <AvatarFallback className="bg-primary/10 text-primary">
                {fallbackInitial ? fallbackInitial.charAt(0) : <Camera className="w-12 h-12" />}
              </AvatarFallback>
            </Avatar>
            <Button type="button" variant="link" onClick={() => fileInputRef.current?.click()}>Change Picture</Button>
          </div>

          <div className="space-y-6 border-t pt-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register('fullName')} />
                {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              {isMentor ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="professionalTitle">Professional Title</Label>
                    <Input id="professionalTitle" {...register('professionalTitle')} />
                    {errors.professionalTitle && <p className="text-destructive text-sm mt-1">{errors.professionalTitle.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" {...register('company')} />
                    {errors.company && <p className="text-destructive text-sm mt-1">{errors.company.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input id="experience" {...register('experience')} />
                    {errors.experience && <p className="text-destructive text-sm mt-1">{errors.experience.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" className="min-h-[120px]" {...register('bio')} />
                    {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="helpWith">What can you help with?</Label>
                    <Textarea id="helpWith" placeholder="e.g., Career development, technical skills, leadership..." {...register('helpWith')} />
                    {errors.helpWith && <p className="text-destructive text-sm mt-1">{errors.helpWith.message}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="currentRole">Current Role</Label>
                    <Input id="currentRole" {...register('currentRole')} />
                    {errors.currentRole && <p className="text-destructive text-sm mt-1">{errors.currentRole.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goals">Goals</Label>
                    <Textarea id="goals" className="min-h-[120px]" {...register('goals')} />
                    {errors.goals && <p className="text-destructive text-sm mt-1">{errors.goals.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interests">Areas of Interest</Label>
                    <Input id="interests" {...register('interests')} />
                    {errors.interests && <p className="text-destructive text-sm mt-1">{errors.interests.message}</p>}
                  </div>
                </>
              )}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
