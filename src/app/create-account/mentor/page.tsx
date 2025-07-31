
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, PlusCircle, Camera, Linkedin, Wand2 } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { auth, firestore } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';
import { Separator } from '@/components/ui/separator';

const profileSchemaBase = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  professionalTitle: z.string().min(1, 'Professional title is required'),
  company: z.string().min(1, 'Company is required'),
  bio: z.string().min(1, 'Bio is required'),
  experience: z.string().min(1, 'Experience is required'),
  helpWith: z.string().min(1, 'This field is required'),
});

const profileSchemaWithPassword = profileSchemaBase.extend({
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const profileSchemaOptionalPassword = profileSchemaBase.extend({
    password: z.string().optional(),
});


export default function CreateMentorAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profilePicture, setProfilePicture] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [googleUser, setGoogleUser] = React.useState<{uid: string; email: string; displayName: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm<z.infer<typeof profileSchemaOptionalPassword>>({
    resolver: zodResolver(googleUser ? profileSchemaOptionalPassword : profileSchemaWithPassword),
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('googleUser');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setGoogleUser(parsedUser);
            setValue('fullName', parsedUser.displayName || '');
            setValue('email', parsedUser.email || '');
        }
    }
  }, [setValue]);

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

  const processAccountCreation = async (data: z.infer<typeof profileSchemaOptionalPassword>, redirectPath: string, toastDescription: string) => {
    setIsSubmitting(true);
    try {
      let userId: string;
      let userEmail: string | null;

      if (googleUser) {
        userId = googleUser.uid;
        userEmail = googleUser.email;
      } else {
        if (!data.password) {
            toast({ variant: 'destructive', title: 'Password is required' });
            setIsSubmitting(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        userId = user.uid;
        userEmail = user.email;
      }

      const { password, ...profileData } = data;
      await setDoc(doc(firestore, 'mentors', userId), {
        uid: userId, // Ensure UID is saved in the document
        email: userEmail,
        role: 'mentor',
        ...profileData,
        profilePictureUrl: profilePicture,
        createdAt: serverTimestamp(),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', 'mentor');
        localStorage.setItem('userName', data.fullName);
        localStorage.removeItem('googleUser'); // Clean up
      }

      toast({
        title: 'Account Created!',
        description: toastDescription,
      });

      router.push(redirectPath);
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: 'destructive',
          title: 'Email Already Registered',
          description: (
            <span>
              This email is already in use. Please{' '}
              <Link href="/login" className="underline font-bold">
                log in
              </Link>
              .
            </span>
          ),
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Could not create your account. Please try again.',
        });
      }
      console.error('Error creating account: ', error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCreateAndClone = async () => {
      const isValid = await trigger();
      if (isValid) {
          handleSubmit((data) => processAccountCreation(data, '/mentor-ai-cloning/setup', 'Your mentor profile has been created. Now, let\'s create your AI clone.'))();
      }
  };
  
  const handleCreateOnly = async () => {
      const isValid = await trigger();
      if (isValid) {
          handleSubmit((data) => processAccountCreation(data, '/dashboard', 'Your mentor profile has been created.'))();
      }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="tech-background -z-10"></div>
      <header className="w-full max-w-4xl mx-auto flex justify-start items-center py-4">
        <Button asChild variant="ghost" className="hover:bg-primary/10">
          <Link href="/choose-path">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Role Selection
          </Link>
        </Button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold font-headline">Create Your Mentor Account</h1>
            <p className="text-muted-foreground mt-2">
              Showcase your expertise and help others find the perfect mentor match
            </p>
          </div>
          <Card className="w-full bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20 text-left">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold">Account & Profile Information</h2>
                <Button variant="outline">
                    <Linkedin className="mr-2 h-4 w-4" />
                    Sync with LinkedIn
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                 <div className="flex flex-col items-center space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <Avatar
                    className="w-32 h-32 cursor-pointer border-4 border-primary/20 hover:border-primary/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AvatarImage src={profilePicture ?? undefined} alt="Profile picture" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Camera className="w-12 h-12" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Profile Picture
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your.email@example.com" {...register('email')} disabled={!!googleUser} />
                        {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                    </div>
                    {!googleUser && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" placeholder="Your full name" {...register('fullName')} />
                     {errors.fullName && <p className="text-destructive text-xs">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="professional-title">Professional Title</Label>
                    <Input id="professional-title" placeholder="e.g., Senior Software Engineer" {...register('professionalTitle')} />
                    {errors.professionalTitle && <p className="text-destructive text-xs">{errors.professionalTitle.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Current or most recent company" {...register('company')} />
                  {errors.company && <p className="text-destructive text-xs">{errors.company.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell potential mentees about your background and expertise..." className="min-h-[120px]" {...register('bio')} />
                  {errors.bio && <p className="text-destructive text-xs">{errors.bio.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input id="experience" placeholder="e.g., 10+ years" {...register('experience')} />
                    {errors.experience && <p className="text-destructive text-xs">{errors.experience.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="help-with">What can you help with?</Label>
                  <Textarea id="help-with" placeholder="Career development, technical skills, leadership..." {...register('helpWith')} />
                  {errors.helpWith && <p className="text-destructive text-xs">{errors.helpWith.message}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button type="button" size="lg" className="w-full" variant="secondary" onClick={handleCreateOnly} disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Account Only'}
                    </Button>
                    <Button type="button" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleCreateAndClone} disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : <><Wand2 className="mr-2 h-4 w-4" /> Create & Setup AI Clone</>}
                    </Button>
                </div>
                
                <p className="text-xs text-center text-muted-foreground pt-4">
                    Already have an account? <Link href="/login" className="underline hover:text-primary">Log in</Link>.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
