'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/app/logo';
import { ArrowRight, Users, Star, Target, MessageCircle, Rocket, Wand2, CalendarCheck, FileText, UserCheck, UserPlus, FileSignature, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MentorMarquee } from '@/components/app/mentor-marquee';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Image from 'next/image';

const FeatureCard = ({ icon: Icon, title, description, className }: { icon: React.ElementType; title: string; description: string, className?: string }) => (
    <Card className={cn("bg-card/60 backdrop-blur-sm border-primary/20 p-6 shadow-lg shadow-primary/20 text-center flex flex-col items-center", className)}>
        <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 flex-grow">{description}</p>
    </Card>
);

const StepCard = ({ icon: Icon, title, description, step }: { icon: React.ElementType; title: string; description: string, step: number }) => (
    <div className="relative flex flex-col items-center text-center">
        <div className="relative">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 mb-4">
                <Icon className="w-10 h-10 text-primary" />
            </div>
             <div className="absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                {step}
            </div>
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
);


export default function LandingPage() {
    return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-background text-foreground">
        
        <main className="flex-1 flex flex-col items-center w-full px-4 z-10 space-y-20 py-12">
            
            <section className="w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-6 pt-12">
                <Logo className="w-20 h-20 text-primary" />
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline">
                    MentorFlow
                </h1>
                <p className="max-w-3xl text-lg sm:text-xl text-muted-foreground">
                    MentorFlow is a transformative platform bridging ambition with experience. We use AI to connect you with human mentors, provide an AI mentor for instant guidance, summarize sessions, and provide tools for growth.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                    <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 px-8 rounded-full shadow-lg shadow-primary/20">
                        <Link href="/choose-path">Start Your Journey <ArrowRight className="ml-2" /></Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="bg-card/60 backdrop-blur-sm border-primary/20 text-lg py-6 px-8 rounded-full">
                        <Link href="/login">Login</Link>
                    </Button>
                </div>
            </section>

            <MentorMarquee />

            <section className="w-full max-w-5xl mx-auto pt-8 text-center">
                 <h2 className="text-3xl font-bold font-headline mb-4">How MentorFlow Works</h2>
                 <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">A simple, guided path to meaningful professional relationships, whether you're sharing knowledge or seeking it.</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <StepCard step={1} icon={UserPlus} title="Create Your Profile" description="Sign up as a mentor or mentee and build a profile that showcases your skills and goals." />
                    <StepCard step={2} icon={UserCheck} title="Find Your Match" description="Our AI helps you discover the perfect connection based on your needs and expertise." />
                    <StepCard step={3} icon={FileSignature} title="Connect & Collaborate" description="Use our integrated chat, scheduling, and resource tools to grow together." />
                 </div>
            </section>

            <section className="w-full max-w-6xl mx-auto pt-8 text-center">
                <h2 className="text-3xl font-bold font-headline mb-4">Features Built for Growth</h2>
                <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">We provide the tools you need to make every mentorship interaction impactful and efficient.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard 
                        icon={Users} 
                        title="AI-Powered Matching" 
                        description="Our smart algorithm goes beyond keywords to connect you with mentors and mentees based on compatibility, goals, and communication styles."
                    />
                     <FeatureCard 
                        icon={Wand2} 
                        title="AI Session Summaries"
                        description="Automatically generate concise summaries of your mentorship calls, highlighting key discussion points and action items so you never lose track."
                    />
                    <FeatureCard 
                        icon={CalendarCheck} 
                        title="Smart Scheduler"
                        description="Effortlessly schedule meetings with a GenAI tool that considers both parties' time zones and availability to suggest optimal times."
                    />
                    <FeatureCard 
                        icon={FileText} 
                        title="Resource Hub"
                        description="A shared library within each connection where mentors can upload documents, links, and tools relevant to the mentee's goals."
                    />
                    <FeatureCard 
                        icon={Star} 
                        title="Verified Profiles"
                        description="Build trust with a community of verified professionals. We ensure that profiles are authentic and represent real-world expertise."
                    />
                    <FeatureCard 
                        icon={Target} 
                        title="Goal-Oriented Framework"
                        description="Set clear objectives and track progress. Mentees can call our AI Mentor for guidance on their career path and to identify missing skills needed to achieve their goals."
                    />
                </div>
            </section>

             <section className="w-full max-w-4xl mx-auto pt-8 text-center">
                 <h2 className="text-3xl font-bold font-headline mb-4">Our Vision</h2>
                 <Card className="bg-card/60 backdrop-blur-sm border-primary/20 p-6 shadow-lg shadow-primary/20">
                     <CardContent className="p-0">
                         <p className="text-lg text-muted-foreground italic">
                            "To create a transformative platform that bridges ambition and experience—empowering youth to level up through real-world guidance, while giving mentors a meaningful way to amplify their visibility and contribute to building a more skilled, inspired, and forward-moving society."
                         </p>
                     </CardContent>
                 </Card>
            </section>

             <section className="w-full max-w-4xl mx-auto pt-8 text-center">
                 <h2 className="text-3xl font-bold font-headline mb-4">Our Commitment to Your Privacy</h2>
                 <Card className="bg-card/60 backdrop-blur-sm border-primary/20 p-6 shadow-lg shadow-primary/20 text-left">
                    <CardHeader className="flex-row gap-4 items-center">
                        <Shield className="w-12 h-12 text-primary" />
                        <div>
                            <CardTitle>How We Use Your Google Data</CardTitle>
                            <CardDescription>Transparency is one of our core values.</CardDescription>
                        </div>
                    </CardHeader>
                     <CardContent className="pt-0">
                         <p className="text-muted-foreground">
                           When you sign in with Google, we request access to your basic profile information (name, email, and profile picture). This data is used solely for the purpose of creating and managing your account on MentorFlow. We use your name and picture to personalize your profile and help you connect with others. Your email is used for authentication and communication related to your account. We do not share your Google user data with any third parties. For more details, please review our full <Link href="/privacy-policy" className="text-primary underline">Privacy Policy</Link>.
                         </p>
                     </CardContent>
                 </Card>
            </section>

        </main>

        <footer className="w-full border-t border-primary/10 mt-auto py-6 px-4 z-10 bg-background/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MentorFlow. All Rights Reserved.</p>
                <div className="flex items-center gap-4">
                    <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Terms of Service
                    </Link>
                    <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </footer>
    </div>
  );
}
