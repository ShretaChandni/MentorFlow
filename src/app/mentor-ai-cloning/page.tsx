
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { MeAiLogo } from '@/components/icons/me-ai-logo';

export default function MentorAiCloningPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="tech-background -z-10"></div>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20 text-center p-8">
            <CardHeader>
                <div className="mx-auto w-fit mb-4">
                    <MeAiLogo className="w-24 h-24 text-primary" />
                </div>
                <CardTitle className="text-5xl font-bold font-headline">
                    Me<span className="text-primary">.</span>AI
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg pt-2">
                    Create your AI Clone
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Create an AI version of yourself that can answer mentee questions, provide initial guidance, and manage your schedule, all based on your unique expertise and communication style.
                </p>
                 <Button asChild size="lg" className="mt-8">
                    <Link href="/mentor-ai-cloning/setup">Proceed to Setup <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
