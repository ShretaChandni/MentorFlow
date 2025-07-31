
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResourcesPage() {
    const { userData, loading: authLoading } = useAuth();
    
    if (authLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-12 w-1/2" />
                </div>
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    // This check is now robust. It looks for the explicit `quizCompleted` flag.
    const hasQuizResults = userData?.quizCompleted === true;
    const isMentor = userData?.role === 'mentor';

    return (
        <>
            <div className="space-y-1 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">Resource Hub</h1>
                <p className="text-muted-foreground">Your personalized tools for growth and discovery.</p>
            </div>

             {isMentor ? (
                <Card className="mb-6 bg-secondary/50 border-border shadow-lg text-center animate-fade-in-up">
                     <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
                           <BookOpen className="text-primary h-8 w-8"/> More Resources Coming Soon
                        </CardTitle>
                        <CardDescription>We are developing more tools and resources to help you in your mentorship journey. Stay tuned!</CardDescription>
                    </CardHeader>
                </Card>
             ) : hasQuizResults ? (
                <Card className="mb-6 bg-primary/10 border-primary/20 shadow-lg shadow-primary/20 text-center animate-fade-in-up">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
                           <Sparkles className="text-primary h-8 w-8"/> Your Career Blueprint
                        </CardTitle>
                        <CardDescription>You've completed the psychometric test. Revisit your personalized results and action plan any time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild size="lg">
                            <Link href="/quiz-results">View My Results <ArrowRight className="ml-2 h-5 w-5"/></Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                 <Card className="mb-6 bg-secondary/50 border-border shadow-lg text-center animate-fade-in-up">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
                           <BookOpen className="text-primary h-8 w-8"/> Find Your Path
                        </CardTitle>
                        <CardDescription>Ready to discover your professional archetype? Take our comprehensive psychometric test to unlock personalized career insights.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild size="lg">
                            <Link href="/mentee-quiz">Take the Career Quiz <ArrowRight className="ml-2 h-5 w-5"/></Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
