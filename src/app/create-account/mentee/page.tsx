
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, PlusCircle, Camera, Linkedin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { auth, firestore } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const profileSchemaBase = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  currentRole: z.string().min(1, 'Current role is required'),
  goals: z.string().min(1, 'Goals are required'),
  interests: z.string().min(1, 'Interests are required'),
  ageGroup: z.string({ required_error: "Please select an age group." }),
  education: z.string({ required_error: "Please select an education level." }),
  location: z.string({ required_error: "Please select a location." }),
});

const profileSchemaWithPassword = profileSchemaBase.extend({
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const profileSchemaOptionalPassword = profileSchemaBase.extend({
    password: z.string().optional(),
});


export default function CreateMenteeAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profilePicture, setProfilePicture] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [googleUser, setGoogleUser] = React.useState<{uid: string; email: string; displayName: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, control } = useForm<z.infer<typeof profileSchemaOptionalPassword>>({
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

  const onFormSubmit: SubmitHandler<z.infer<typeof profileSchemaOptionalPassword>> = async (data) => {
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
      
      await setDoc(doc(firestore, 'mentees', userId), {
        uid: userId, // Ensure UID is saved in the document
        email: userEmail,
        role: 'mentee',
        ...profileData,
        profilePictureUrl: profilePicture,
        createdAt: serverTimestamp(),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', 'mentee');
        localStorage.setItem('userName', data.fullName);
        localStorage.removeItem('googleUser'); // Clean up
      }

      toast({
        title: 'Account Created!',
        description: 'Now, let\'s discover your personality archetype.',
      });

      router.push('/mentee-quiz');
      
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
            <h1 className="text-3xl sm:text-4xl font-bold font-headline">Create Your Mentee Account</h1>
            <p className="text-muted-foreground mt-2">
              Tell us about yourself to find the best mentors.
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
              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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

                <div className="grid md:grid-cols-2 gap-6">
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

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" placeholder="Your full name" {...register('fullName')} />
                    {errors.fullName && <p className="text-destructive text-xs">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-role">Current Role or Field of Study</Label>
                    <Input id="current-role" placeholder="e.g., Junior Developer, CS Student" {...register('currentRole')} />
                    {errors.currentRole && <p className="text-destructive text-xs">{errors.currentRole.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <Label>Age Group</Label>
                         <Controller
                            name="ageGroup"
                            control={control}
                            render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select Age Group" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="18-20">18-20</SelectItem>
                                    <SelectItem value="21-23">21-23</SelectItem>
                                    <SelectItem value="24-25">24-25</SelectItem>
                                </SelectContent>
                            </Select>
                            )}
                        />
                         {errors.ageGroup && <p className="text-destructive text-xs">{errors.ageGroup.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label>Education Level</Label>
                        <Controller
                            name="education"
                            control={control}
                            render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select Education" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high-school">High School</SelectItem>
                                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                                    <SelectItem value="graduate">Graduate</SelectItem>
                                    <SelectItem value="post-graduate">Post Graduate</SelectItem>
                                </SelectContent>
                            </Select>
                            )}
                        />
                         {errors.education && <p className="text-destructive text-xs">{errors.education.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label>Location in India</Label>
                        <Controller
                            name="location"
                            control={control}
                            render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="north">North India</SelectItem>
                                    <SelectItem value="south">South India</SelectItem>
                                    <SelectItem value="east">East India</SelectItem>
                                    <SelectItem value="west">West India</SelectItem>
                                    <SelectItem value="central">Central India</SelectItem>
                                </SelectContent>
                            </Select>
                            )}
                        />
                        {errors.location && <p className="text-destructive text-xs">{errors.location.message}</p>}
                    </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="goals">Your Goals</Label>
                  <Textarea id="goals" placeholder="What do you want to achieve? What are you passionate about?" className="min-h-[120px]" {...register('goals')} />
                  {errors.goals && <p className="text-destructive text-xs">{errors.goals.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="interests">Areas of Interest</Label>
                    <Input id="interests" placeholder="e.g., Web Development, Product Management" {...register('interests')} />
                    {errors.interests && <p className="text-destructive text-xs">{errors.interests.message}</p>}
                </div>
                <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Account...' : 'Create Account & Start Quiz'}
                </Button>
                <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-sm text-muted-foreground">OR</span>
                </div>
                 <Button type="button" size="lg" variant="secondary" className="w-full" onClick={() => router.push('/mentee-quiz')}>
                  Skip and Take the Quiz
                </Button>
                <p className="text-xs text-center text-muted-foreground">
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
