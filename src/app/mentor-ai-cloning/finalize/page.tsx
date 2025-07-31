
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { MeAiLogo } from '@/components/icons/me-ai-logo';

export default function MentorAiCloningFinalizePage() {
    const [isCloning, setIsCloning] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCloning(false);
        }, 3000); // Simulate cloning process for 3 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative flex flex-col min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <div className="tech-background -z-10"></div>
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20 text-center p-8">
                    <CardHeader>
                        <div className="mx-auto w-fit mb-4">
                            {isCloning ? (
                                <Loader2 className="w-24 h-24 text-primary animate-spin" />
                            ) : (
                                <CheckCircle className="w-24 h-24 text-green-500" />
                            )}
                        </div>
                        <CardTitle className="text-3xl font-bold font-headline">
                            {isCloning ? 'Finalizing Your AI Assistant...' : 'Configuration Complete!'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-lg">
                            {isCloning 
                                ? "Our AI is analyzing your responses and calibrating your digital persona. This may take a few moments."
                                : "Your Me.AI assistant is now ready to assist mentees! It will use your unique style to provide initial guidance and support."
                            }
                        </p>
                        {!isCloning && (
                            <Button asChild size="lg" className="mt-8">
                                <Link href="/dashboard">
                                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
