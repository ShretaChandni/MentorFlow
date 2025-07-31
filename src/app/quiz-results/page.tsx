
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Sparkles, Target, RotateCcw, Loader2, Quote, ArrowRight, Swords } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateInsights, GenerateInsightsOutput, GenerateInsightsInput } from '@/ai/flows/generate-insights';
import { saveQuizResults } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { QUESTIONS } from '@/lib/traits';

export default function QuizResultsPage() {
    const { user, userData, loading: authLoading, refetchUserData } = useAuth();
    const [initialInsights, setInitialInsights] = useState<GenerateInsightsOutput | null>(null);
    const [finalInsights, setFinalInsights] = useState<GenerateInsightsOutput | null>(null);
    const [fullData, setFullData] = useState<GenerateInsightsInput | null>(null);
    const [dreamCareer, setDreamCareer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const loadResults = () => {
            if (typeof window !== 'undefined') {
                // Priority 1: Check for logged-in user with saved final results
                if (userData?.personalityInsights?.reverseDevelopment) {
                    setFinalInsights(userData.personalityInsights);
                    setIsLoading(false);
                    return;
                }
                
                // Priority 2: Check for logged-in user with saved initial results
                if (userData?.personalityInsights && userData?.traitScores && userData?.answers) {
                    setInitialInsights(userData.personalityInsights);
                    setFullData({
                        traitScores: userData.traitScores,
                        answers: userData.answers,
                    });
                    setIsLoading(false);
                    return;
                }

                // Priority 3: Check for results from a non-logged-in user in localStorage
                const storedInsightsStr = localStorage.getItem('quizInitialInsights');
                const storedDataStr = localStorage.getItem('quizAllData');
                if (storedInsightsStr && storedDataStr) {
                    try {
                        const storedInsights = JSON.parse(storedInsightsStr);
                        const storedData = JSON.parse(storedDataStr);
                        setInitialInsights(storedInsights);
                        setFullData(storedData);
                    } catch (e) {
                         console.error("Failed to parse localStorage data", e);
                         toast({ variant: 'destructive', title: 'Error loading results', description: 'Could not read your saved results. Please take the quiz again.' });
                         router.push('/mentee-quiz');
                    } finally {
                        setIsLoading(false);
                    }
                    return;
                }
                
                // If no data found after auth has loaded, redirect to quiz
                if (!authLoading) {
                    toast({ variant: 'destructive', title: 'No Results Found', description: 'Please complete the quiz to see your results.' });
                    router.push('/mentee-quiz');
                }
            }
        };

        if (!authLoading) {
            loadResults();
        }
    }, [router, toast, userData, authLoading]);
    
    const onDreamCareerSubmit = async () => {
        if (!dreamCareer.trim()) {
            toast({ variant: 'destructive', title: 'Please enter your dream career.' });
            return;
        }
        if (!fullData || !fullData.traitScores || !fullData.answers) {
            toast({ variant: 'destructive', title: 'Missing Data', description: 'Your assessment data could not be found. Please try the quiz again.' });
            router.push('/mentee-quiz');
            return;
        }

        setIsGenerating(true);

        try {
            const finalInput: GenerateInsightsInput = {
                ...fullData,
                dreamCareer: dreamCareer,
                isFinalAnalysis: true,
            };
            
            const finalResult = await generateInsights(finalInput);
            setFinalInsights(finalResult);

            if (user) {
                await saveQuizResults(user.uid, {
                    answers: finalInput.answers,
                    traitScores: finalInput.traitScores,
                    ...finalResult
                });
                refetchUserData();
            }

        } catch (error: any) {
            console.error('Error generating custom plan:', error);
            toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate your custom plan. Please try again.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleFinish = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('quizInitialInsights');
            localStorage.removeItem('quizAllData');
        }
        if (user) {
            router.push('/dashboard/resources');
        } else {
            router.push('/');
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="max-w-4xl mx-auto p-4 animate-pulse">
                <header className="text-center mb-12">
                    <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                </header>
                <div className="space-y-6 mt-12">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }
    
    const insightsToDisplay = finalInsights || initialInsights;

    if (!insightsToDisplay) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <h2 className="text-2xl font-bold">Loading Your Results...</h2>
                <p className="text-muted-foreground">If this takes too long, please try taking the quiz again.</p>
                <Button onClick={() => router.push('/mentee-quiz')} className="mt-4">Take Quiz</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <header className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold flex items-center justify-center gap-3 text-primary">
                  <Sparkles className="w-10 h-10" />
                  Your Career Blueprint
                </h1>
                <p className="text-muted-foreground mt-3 text-lg">
                  Your personality assessment has revealed your professional potential.
                </p>
            </header>
            <div className="space-y-6 mt-12">
                <Card className="text-center animate-fade-in-up bg-card/50" style={{ animationDelay: '0ms' }}>
                    <CardHeader>
                         <CardDescription className="text-lg">Your Professional Archetype</CardDescription>
                        <CardTitle className="text-4xl font-headline font-bold text-primary">
                            {insightsToDisplay.forwardDevelopment.archetype}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <blockquote className="border-l-4 border-accent pl-4 italic text-lg">
                            <Quote className="w-6 h-6 inline-block mr-2 text-primary/50" />
                            {insightsToDisplay.quote}
                        </blockquote>
                    </CardContent>
                </Card>

                <Card className="animate-fade-in-up bg-card/50" style={{ animationDelay: '200ms' }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Target className="w-6 h-6 text-primary" />
                            Forward Path: Based on Your Results
                        </CardTitle>
                        <CardDescription>This path is scientifically tailored to your innate strengths and personality.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-left">
                        <div>
                          <h3 className="text-2xl font-bold">{insightsToDisplay.forwardDevelopment.recommendedCareer.title}</h3>
                          <p className="text-muted-foreground">{insightsToDisplay.forwardDevelopment.recommendedCareer.description}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mt-4 mb-2">Your 3-Year Action Plan</h4>
                          <Accordion type="single" collapsible className="w-full">
                                {insightsToDisplay.forwardDevelopment.threeYearPlan.map((step, index) => (
                                    <AccordionItem value={`fwd-item-${index}`} key={index}>
                                        <AccordionTrigger className="text-lg hover:no-underline">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">{index + 1}</div>
                                            Year {index + 1}
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-base pl-12">
                                          {step}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </CardContent>
                </Card>
                
                {insightsToDisplay.reverseDevelopment && (
                  <Card className="animate-fade-in-up bg-card/50" style={{ animationDelay: '400ms' }}>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                              <RotateCcw className="w-6 h-6 text-primary" />
                              Reverse Path: Achieving Your Goal
                          </CardTitle>
                          <CardDescription>A custom plan to help you achieve your dream career.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-left">
                          <div>
                              <h3 className="text-lg font-bold">Feasibility & Analysis</h3>
                              <Badge variant={insightsToDisplay.reverseDevelopment.isFeasible ? "default" : "destructive"} className="my-2">{insightsToDisplay.reverseDevelopment.isFeasible ? "Good Fit!" : "Challenging Path"}</Badge>
                              <p className="text-muted-foreground">{insightsToDisplay.reverseDevelopment.analysis}</p>
                          </div>
                           <div>
                              <h4 className="font-bold text-lg mt-4 mb-2">Your 3-Year Action Plan</h4>
                              <Accordion type="single" collapsible className="w-full">
                                  {insightsToDisplay.reverseDevelopment.threeYearPlan.map((step, index) => (
                                      <AccordionItem value={`rev-item-${index}`} key={index}>
                                          <AccordionTrigger className="text-lg hover:no-underline">
                                              <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">{index + 1}</div>
                                              Year {index + 1}
                                              </div>
                                          </AccordionTrigger>
                                          <AccordionContent className="text-base pl-12">
                                              {step}
                                          </AccordionContent>
                                      </AccordionItem>
                                  ))}
                              </Accordion>
                          </div>
                      </CardContent>
                  </Card>
                )}

                 {!finalInsights && (
                    <Card className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Swords className="w-6 h-6 text-primary" />
                                Forge a Different Path?
                            </CardTitle>
                            <CardDescription>
                                Is your heart set on a different career? Enter it below to get a personalized plan to bridge the gap.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="e.g., Executive"
                                    value={dreamCareer}
                                    onChange={(e) => setDreamCareer(e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <Button onClick={onDreamCareerSubmit} disabled={isGenerating} className="w-full">
                                    {isGenerating ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                    ) : (
                                        'Generate My Custom Plan'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                 <div className="text-center flex flex-wrap justify-center gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                    <Button onClick={handleFinish} size="lg">
                        Finish & Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
