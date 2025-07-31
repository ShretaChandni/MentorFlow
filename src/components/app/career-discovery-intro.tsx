
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { InnerBeingLogo } from "@/components/icons/innerbeing-logo";
import { Brain, HeartHandshake, Rocket, Target, Users, ArrowLeft } from "lucide-react";
import { Control, Controller } from "react-hook-form";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";

const AVATARS: { id: string; src: string; hint: string }[] = [
  { id: 'avatar1', src: 'https://avatar.iran.liara.run/public/girl?username=avatar1', hint: 'cute girl illustration' },
  { id: 'avatar2', src: 'https://avatar.iran.liara.run/public/boy?username=avatar2', hint: 'cute boy illustration' },
  { id: 'avatar3', src: 'https://avatar.iran.liara.run/public/boy?username=avatar3', hint: 'boy with dark hair' },
  { id: 'avatar4', src: 'https://avatar.iran.liara.run/public/girl?username=avatar4', hint: 'girl with buns' },
  { id: 'avatar5', src: 'https://avatar.iran.liara.run/public/boy?username=avatar5', hint: 'boy with glasses' },
];

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <Card className="bg-card/60 backdrop-blur-sm border-primary/20 p-4 text-center shadow-lg shadow-primary/20 hover:border-primary/40 transition-all duration-300">
        <CardContent className="p-2 flex flex-col items-center justify-center h-full">
            <div className="p-3 bg-primary/10 rounded-full mb-3 text-primary">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-md mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const AchievementDialog = ({ isOpen, onContinue }: { isOpen: boolean, onContinue: () => void }) => {
    return (
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-md text-center p-8 bg-card/80 backdrop-blur-md">
                <DialogHeader>
                    <div className="mx-auto w-fit mb-4 p-4 bg-primary/10 rounded-full">
                        <Rocket className="w-16 h-16 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">Achievement Unlocked!</DialogTitle>
                    <DialogDescription className="text-primary text-lg font-semibold">First Steps</DialogDescription>
                </DialogHeader>
                <p className="text-muted-foreground">You've started your assessment journey.</p>
                <div className="mt-6">
                    <Button onClick={onContinue} size="lg" className="w-full">Awesome!</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

interface CareerDiscoveryIntroProps {
    control: Control<any>;
    onStart: () => void;
    onBack: () => void;
    username: string;
    selectedAvatar: string;
    onAvatarChange: (avatarId: string) => void;
}

export function CareerDiscoveryIntro({ control, onStart, onBack, username, selectedAvatar, onAvatarChange }: CareerDiscoveryIntroProps) {
    const [showAchievement, setShowAchievement] = useState(false);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowAchievement(true);
    };

    const handleContinue = () => {
        setShowAchievement(false);
        onStart();
    }

    return (
        <>
        <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <InnerBeingLogo className="w-10 h-10 text-primary" />
                    <span className="font-bold text-lg">Career Quest India</span>
                </div>
                <div className="flex items-center gap-4">
                     <Button onClick={onBack} variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <Switch id="audio-mode" />
                        <Label htmlFor="audio-mode">Audio On</Label>
                    </div>
                </div>
            </header>

            <main className="text-center space-y-12">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold font-headline">Discover Your Career Path</h1>
                    <p className="max-w-3xl mx-auto mt-4 text-lg text-muted-foreground">
                        India's comprehensive psychometric assessment designed for students aged 18-25. Get personalized career recommendations based on your personality, interests, and skills.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FeatureCard
                        icon={Target}
                        title="Holland Code Analysis"
                        description="Discover your career interests through RIASEC framework"
                    />
                    <FeatureCard
                        icon={Brain}
                        title="Big Five Personality"
                        description="Understand your personality traits and work style"
                    />
                    <FeatureCard
                        icon={HeartHandshake}
                        title="Emotional Intelligence"
                        description="Assess your EQ and interpersonal skills"
                    />
                    <FeatureCard
                        icon={Users}
                        title="Indian Context"
                        description="Tailored for Indian job market and cultural values"
                    />
                </div>

                <Card className="max-w-lg mx-auto text-left p-6 sm:p-8 bg-card/60 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
                    <h2 className="text-2xl font-bold text-center mb-6">Let's Get Started!</h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Choose Your Avatar</Label>
                             <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
                                {AVATARS.map(avatarInfo => (
                                    <button 
                                    key={avatarInfo.id}
                                    type="button"
                                    onClick={() => onAvatarChange(avatarInfo.id)} 
                                    className={cn(
                                        'p-1 rounded-full transition-all duration-200', 
                                        selectedAvatar === avatarInfo.id ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-accent/20'
                                    )}
                                    >
                                    <Image src={avatarInfo.src} alt="Avatar" width={64} height={64} className="rounded-full" data-ai-hint={avatarInfo.hint} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="your-name">Your Name</Label>
                            <Controller
                                name="username"
                                control={control}
                                render={({ field }) => <Input id="your-name" placeholder="Enter your full name" {...field} disabled />}
                            />
                        </div>
                         <div>
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
                        </div>
                        <div>
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
                        </div>
                         <div>
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
                        </div>
                        <div className="pt-4">
                            <Button type="submit" size="lg" className="w-full text-lg h-12">
                                Begin Your Career Discovery Journey <Rocket className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </form>
                </Card>
            </main>
        </div>
        <AchievementDialog isOpen={showAchievement} onContinue={handleContinue} />
        </>
    );
}
