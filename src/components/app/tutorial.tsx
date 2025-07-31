
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LayoutDashboard, Search, Users, User, Rocket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const tutorialSteps = [
    {
        icon: LayoutDashboard,
        title: "Welcome to Your Dashboard!",
        description: "This is your mission control. Here you can see a quick overview of your mentorship activity, stats, and quick actions.",
    },
    {
        icon: Search,
        title: "Discover Connections",
        description: "Use the 'Browse' section to discover and connect with potential mentors or mentees. It's like a dating app, but for your career!",
    },
    {
        icon: Users,
        title: "Manage Connections",
        description: "Once you send or receive a request, you can manage it in the 'Connections' tab. Approve new requests and start chatting.",
    },
    {
        icon: User,
        title: "Complete Your Profile",
        description: "A complete profile gets more attention! Head over to the 'Profile' page to make sure your information is up-to-date.",
    },
    {
        icon: Rocket,
        title: "You're All Set!",
        description: "You're ready to start your mentorship journey. Click below to get started.",
    },
];

interface TutorialProps {
    isOpen: boolean;
    onFinish: () => void;
}

export function Tutorial({ isOpen, onFinish }: TutorialProps) {
    const { userData } = useAuth();
    const [step, setStep] = useState(0);

    const handleNext = () => {
        if (step < tutorialSteps.length - 1) {
            setStep(step + 1);
        } else {
            onFinish();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    // Dynamically adjust the second step's description based on user role
    if (userData?.role) {
        tutorialSteps[1].description = `Use the 'Browse' section to discover and connect with potential ${userData.role === 'mentor' ? 'mentees' : 'mentors'}. It's like a dating app, but for your career!`;
    }

    const currentStep = tutorialSteps[step];
    const progress = ((step + 1) / tutorialSteps.length) * 100;
    
    // Don't render the dialog if it's not open to prevent hydration issues
    if (!isOpen) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onFinish()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-full">
                            <currentStep.icon className="w-8 h-8" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl font-bold font-headline">{currentStep.title}</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground pt-2">
                        {currentStep.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="px-6 pb-2">
                    <Progress value={progress} className="w-full h-2" />
                </div>
                <DialogFooter className="flex-row justify-between w-full">
                    {step > 0 ? (
                        <Button variant="outline" onClick={handleBack}>
                            Back
                        </Button>
                    ) : <div></div>}
                    <Button onClick={handleNext}>
                        {step === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

