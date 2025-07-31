
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestore } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Wand2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const aiCloningSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  professionalTitle: z.string().min(1, 'Professional title is required.'),
  company: z.string().min(1, 'Company is required.'),
  helpWith: z.string().min(1, 'Please list your areas of expertise.'),
  tone: z.string().min(1, 'Please select a tone for your AI assistant.'),
  sampleAnswer1: z.string().min(1, 'Please provide an answer.'),
  sampleAnswer2: z.string().min(1, 'Please provide an answer.'),
  sampleAnswer3: z.string().min(1, 'Please provide an answer.'),
});

type AICloningFormValues = z.infer<typeof aiCloningSchema>;

const tones = [
    { value: 'friendly, direct, and inspirational', label: 'Inspirational', description: "Motivating, direct, and encouraging." },
    { value: 'professional, structured, and informative', label: 'Formal', description: "Structured, clear, and knowledge-focused." },
    { value: 'casual, witty, and relatable', label: 'Casual', description: "Relaxed, humorous, and easy-going." },
    { value: 'analytical, precise, and data-driven', label: 'Analytical', description: "Logical, fact-based, and precise." },
];

const sampleQuestions = [
    "What's the best piece of career advice you've ever received?",
    "How do I balance learning new skills with my current work responsibilities?",
    "What's a common mistake you see people make early in their careers?",
];

export default function MentorAiCloningSetupPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    
    const form = useForm<AICloningFormValues>({
        resolver: zodResolver(aiCloningSchema),
        defaultValues: {
            fullName: 'Shreta Chandni',
            professionalTitle: 'Data Scientist',
            company: 'ICON plc',
            helpWith: 'Data Analysis, Python, SQL, Career Growth',
            tone: 'casual, witty, and relatable',
            sampleAnswer1: "The best advice I got was 'Don't follow your passion, follow your effort.' It means find what you're good at and what you're willing to work hard for, and passion will follow. It's less about some magical calling and more about the satisfaction of being great at something.",
            sampleAnswer2: "Don't try to boil the ocean! I always suggest the '1-hour-a-day' rule. Dedicate one focused hour each day to learning. No emails, no meetings. Put it on your calendar like it's a critical appointment. It's amazing what you can accomplish in just five focused hours a week.",
            sampleAnswer3: "Trying to know everything before they start. You learn by doing. I see so many people get stuck in 'tutorial hell.' My advice? Build a small, scrappy project. It'll teach you more than a dozen courses because you're forced to actually solve problems.",
        }
    });

    useEffect(() => {
        // Pre-fill form with existing mentor data if it exists, otherwise use defaults
        if (userData) {
            form.reset({
                fullName: userData.fullName || 'Shreta Chandni',
                professionalTitle: userData.professionalTitle || 'Data Scientist',
                company: userData.company || 'ICON plc',
                helpWith: userData.helpWith || 'Data Analysis, Python, SQL, Career Growth',
                tone: userData.aiCloneConfig?.tone || 'casual, witty, and relatable',
                sampleAnswer1: userData.aiCloneConfig?.sampleAnswer1 || "The best advice I got was 'Don't follow your passion, follow your effort.' It means find what you're good at and what you're willing to work hard for, and passion will follow. It's less about some magical calling and more about the satisfaction of being great at something.",
                sampleAnswer2: userData.aiCloneConfig?.sampleAnswer2 || "Don't try to boil the ocean! I always suggest the '1-hour-a-day' rule. Dedicate one focused hour each day to learning. No emails, no meetings. Put it on your calendar like it's a critical appointment. It's amazing what you can accomplish in just five focused hours a week.",
                sampleAnswer3: userData.aiCloneConfig?.sampleAnswer3 || "Trying to know everything before they start. You learn by doing. I see so many people get stuck in 'tutorial hell.' My advice? Build a small, scrappy project. It'll teach you more than a dozen courses because you're forced to actually solve problems.",
            });
        }
    }, [userData, form]);
    
    const onSubmit = async (data: AICloningFormValues) => {
        setIsProcessing(true);
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to configure your AI assistant.' });
            setIsProcessing(false);
            return;
        }
        
        try {
            const mentorDocRef = doc(firestore, 'mentors', user.uid);
            
            // This object contains only the AI-specific configuration.
            const aiCloneConfig = {
                tone: data.tone,
                sampleAnswer1: data.sampleAnswer1,
                sampleAnswer2: data.sampleAnswer2,
                sampleAnswer3: data.sampleAnswer3,
            };

            // Use setDoc with merge: true to add/update the aiCloneConfig field
            // without overwriting the entire mentor document.
            await setDoc(mentorDocRef, { aiCloneConfig }, { merge: true });
            
            toast({
                title: 'AI Configuration Saved!',
                description: "Your AI assistant's personality has been configured.",
            });
            router.push('/mentor-ai-cloning/finalize');
        } catch (error: any) {
            console.error('Error updating AI clone config:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Error Saving Configuration', 
                description: 'Could not save your settings. Please ensure your profile is complete.' 
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // Redirect if user is not logged in or is not a mentor
    if (!authLoading && (!user || userData?.role !== 'mentor')) {
         return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <p className="mb-4">You must be logged in as a mentor to access this page.</p>
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        );
    }
    
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="tech-background -z-10"></div>
      <header className="w-full max-w-4xl mx-auto flex justify-start items-center py-4">
        <Button asChild variant="ghost" className="hover:bg-primary/10">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20 p-8">
            <CardHeader>
                <CardTitle className="text-3xl font-bold font-headline">Configure Your AI Assistant</CardTitle>
                <CardDescription className="text-lg pt-2">
                    Your answers will teach your AI assistant how to respond in your unique voice.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-left">
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-center">Your Professional Identity</h3>
                        <p className="text-center text-muted-foreground mb-6">This information helps your AI introduce itself correctly. It's pre-filled from your profile.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" {...form.register('fullName')} placeholder="e.g., Jane Doe" disabled/>
                                {form.formState.errors.fullName && <p className="text-destructive text-sm">{form.formState.errors.fullName.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="professionalTitle">Professional Title</Label>
                                <Input id="professionalTitle" {...form.register('professionalTitle')} placeholder="e.g., Senior Software Engineer" disabled/>
                                {form.formState.errors.professionalTitle && <p className="text-destructive text-sm">{form.formState.errors.professionalTitle.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="company">Company</Label>
                                <Input id="company" {...form.register('company')} placeholder="e.g., Google" disabled/>
                                {form.formState.errors.company && <p className="text-destructive text-sm">{form.formState.errors.company.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="helpWith">Areas of Expertise</Label>
                                <Input id="helpWith" {...form.register('helpWith')} placeholder="e.g., React, System Design, Leadership" disabled/>
                                {form.formState.errors.helpWith && <p className="text-destructive text-sm">{form.formState.errors.helpWith.message}</p>}
                            </div>
                        </div>
                    </section>

                    <Separator />

                    <section>
                         <h3 className="text-xl font-semibold mb-4 text-center">Define Your Tone</h3>
                         <Controller
                            control={form.control}
                            name="tone"
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {tones.map((tone) => (
                                         <Label key={tone.value} htmlFor={tone.value} className={`flex flex-col items-start space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors ${field.value === tone.value ? 'border-primary ring-2 ring-primary' : 'border-border'}`}>
                                            <div className="flex items-center w-full">
                                                <RadioGroupItem value={tone.value} id={tone.value} />
                                                <div className="ml-3">
                                                    <p className="font-bold">{tone.label}</p>
                                                    <p className="text-sm text-muted-foreground">{tone.description}</p>
                                                </div>
                                            </div>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            )}
                         />
                         {form.formState.errors.tone && <p className="text-destructive text-center mt-2">{form.formState.errors.tone.message}</p>}
                    </section>

                    <Separator />

                    <section>
                         <h3 className="text-xl font-semibold mb-4 text-center">Provide Sample Answers</h3>
                         <p className="text-center text-muted-foreground mb-6">
                            Answering these questions in your own words will help the AI learn your unique style and perspective.
                         </p>
                         <div className="space-y-6">
                            <div>
                                <Label htmlFor="sampleAnswer1" className="font-semibold">{sampleQuestions[0]}</Label>
                                <Textarea id="sampleAnswer1" {...form.register('sampleAnswer1')} className="mt-2" placeholder="Your answer here..."/>
                                {form.formState.errors.sampleAnswer1 && <p className="text-destructive text-sm mt-1">{form.formState.errors.sampleAnswer1.message}</p>}
                            </div>
                             <div>
                                <Label htmlFor="sampleAnswer2" className="font-semibold">{sampleQuestions[1]}</Label>
                                <Textarea id="sampleAnswer2" {...form.register('sampleAnswer2')} className="mt-2" placeholder="Your answer here..."/>
                                {form.formState.errors.sampleAnswer2 && <p className="text-destructive text-sm mt-1">{form.formState.errors.sampleAnswer2.message}</p>}
                            </div>
                             <div>
                                <Label htmlFor="sampleAnswer3" className="font-semibold">{sampleQuestions[2]}</Label>
                                <Textarea id="sampleAnswer3" {...form.register('sampleAnswer3')} className="mt-2" placeholder="Your answer here..."/>
                                {form.formState.errors.sampleAnswer3 && <p className="text-destructive text-sm mt-1">{form.formState.errors.sampleAnswer3.message}</p>}
                            </div>
                         </div>
                    </section>
                    
                    <div className="flex justify-center pt-4">
                        <Button type="submit" size="lg" disabled={isProcessing}>
                           {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                           {isProcessing ? 'Saving...' : 'Finalize AI Assistant'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
