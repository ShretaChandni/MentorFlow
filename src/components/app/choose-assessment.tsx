
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InnerBeingLogo } from "@/components/icons/innerbeing-logo";
import { ArrowLeft, Brain, Briefcase, CheckCircle, Heart, Search, Puzzle, Rocket, Trophy, Target, Sparkles, Wand2, BarChart, UserCheck, Users, Lightbulb, CheckSquare, Calculator, Gem, Shield, Clock, FileText, BarChart2 } from "lucide-react";
import type { CategoryId } from '@/lib/traits';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChooseAssessmentProps {
    username: string;
    onStartAssessment: (assessmentId: string) => void;
    onBack: () => void;
    completedAssessments: Set<CategoryId>;
    onFinalize: () => void;
    isAudioOn: boolean;
    onAudioToggle: (isOn: boolean) => void;
    xp: number;
    level: number;
}

const AssessmentCard = ({ icon: Icon, title, description, questions, time, level, onClick, iconColor = 'text-primary', isCompleted }: { icon: React.ElementType, title: string, description: string, questions: string, time: string, level: string, onClick: () => void, iconColor?: string, isCompleted: boolean }) => (
    <Card className={`text-left shadow-lg flex flex-col h-full transition-all duration-300 ${isCompleted ? 'bg-green-500/10 border-green-500/50' : 'shadow-primary/20 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40'}`}>
        <CardHeader className="flex flex-row items-start gap-3 pb-4">
            <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-500/20 text-green-500' : `bg-primary/10 ${iconColor}`}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <CardTitle className="text-base font-bold cursor-help">{title}</CardTitle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{description}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <Badge variant={isCompleted ? "default" : "outline"} className={isCompleted ? 'bg-green-600 text-white' : ''}>{isCompleted ? "Done" : "Ready"}</Badge>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> <span>{questions}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> <span>{time}</span>
                </div>
                <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" /> <span>{level}</span>
                </div>
            </div>
            <Button className="w-full mt-auto" onClick={onClick} disabled={isCompleted}>
                {isCompleted ? <><CheckCircle className="mr-2 h-4 w-4" /> Completed</> : 'Start Assessment'}
            </Button>
        </CardContent>
    </Card>
);

const AchievementCard = ({ icon: Icon, title, description, isUnlocked, iconColor = 'text-muted-foreground' }: { icon: React.ElementType, title: string, description: string, isUnlocked: boolean, iconColor?: string }) => (
    <Card className={`text-center p-4 transition-all duration-300 ${isUnlocked ? 'bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20' : 'bg-muted/40'}`}>
        <div className={`mx-auto w-fit p-3 rounded-full mb-2 ${isUnlocked ? `bg-primary/10 ${iconColor}` : 'bg-muted-foreground/10 text-muted-foreground/60'}`}>
            <Icon className="w-8 h-8"/>
        </div>
        <h3 className={`font-semibold text-sm ${!isUnlocked && 'text-muted-foreground/80'}`}>{title}</h3>
        <p className={`text-xs ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>{description}</p>
    </Card>
);


export function ChooseAssessment({ username, onStartAssessment, onBack, completedAssessments, onFinalize, isAudioOn, onAudioToggle, xp, level }: ChooseAssessmentProps) {
    const totalAssessments = 8;
    const achievements = [
        { icon: Rocket, title: 'First Steps', description: 'Started your assessment journey', unlocked: true, color: 'text-primary' },
        { icon: UserCheck, title: 'Dedicated Assessor', description: 'Completed your first assessment', unlocked: completedAssessments.size >= 1 },
        { icon: Puzzle, title: 'Puzzle Master', description: 'Solved your first puzzle', unlocked: completedAssessments.has('puzzles') },
        { icon: Sparkles, title: 'Self-Aware', description: 'Completed personality assessment', unlocked: completedAssessments.has('big-five') },
        { icon: Target, title: 'Career Explorer', description: 'Explored career interests', unlocked: completedAssessments.has('holland-code') },
        { icon: Heart, title: 'Emotional Intelligence', description: 'Assessed your EQ', unlocked: completedAssessments.has('eq') },
        { icon: Brain, title: 'Strategic Thinker', description: 'Completed SWOT analysis', unlocked: completedAssessments.has('swot') },
        { icon: Wand2, title: 'Scenario Expert', description: 'Handled workplace scenarios', unlocked: completedAssessments.has('sjt') },
        { icon: Trophy, title: 'Assessment Champion', description: 'Completed all assessments', unlocked: completedAssessments.size === totalAssessments },
    ];
    
    const allAssessmentsCompleted = completedAssessments.size === totalAssessments;
    const progressPercentage = (completedAssessments.size / totalAssessments) * 100;

    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in-up">
            <header className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={onBack} className="flex items-center gap-3 p-2 h-auto -ml-2">
                    <InnerBeingLogo className="w-10 h-10 text-primary" />
                    <span className="font-bold text-lg hidden sm:block">Career Quest India</span>
                </Button>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch id="audio-mode" checked={isAudioOn} onCheckedChange={onAudioToggle} />
                        <Label htmlFor="audio-mode" className="text-sm">Audio On</Label>
                    </div>
                    <Badge variant="outline" className="text-sm p-2">XP: {xp}</Badge>
                    <Badge variant="outline" className="text-sm p-2">Level: {level}</Badge>
                </div>
            </header>

            <main className="space-y-10">
                <Card className="bg-card/60 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/20">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold font-headline">Choose Your Assessment</h1>
                            <p className="text-muted-foreground text-sm">Complete all assessments to unlock your final career blueprint.</p>
                        </div>
                        <div className="relative w-28 h-28 shrink-0">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    className="stroke-current text-muted/30"
                                    fill="none"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    className="stroke-current text-primary transition-all duration-500"
                                    fill="none"
                                    strokeWidth="2"
                                    strokeDasharray={`${progressPercentage}, 100`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold">{Math.round(progressPercentage)}%</span>
                                <span className="text-xs text-muted-foreground">Complete</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AssessmentCard 
                        icon={Lightbulb}
                        title="Core Aptitude"
                        description="Test your numerical, verbal, logical, and spatial skills."
                        questions="24 questions"
                        time="~20 minutes"
                        level="Foundation"
                        onClick={() => onStartAssessment('aptitude')}
                        iconColor="text-yellow-400"
                        isCompleted={completedAssessments.has('aptitude')}
                    />
                    <AssessmentCard 
                        icon={Search}
                        title="Holland Code Career Explorer"
                        description="Discover your career personality type through RIASEC analysis."
                        questions="12 questions"
                        time="~12 minutes"
                        level="Beginner"
                        onClick={() => onStartAssessment('holland-code')}
                        iconColor="text-blue-400"
                        isCompleted={completedAssessments.has('holland-code')}
                    />
                     <AssessmentCard 
                        icon={Brain}
                        title="Big Five Personality Assessment"
                        description="Explore your personality across five major dimensions."
                        questions="15 questions"
                        time="~10 minutes"
                        level="Intermediate"
                        onClick={() => onStartAssessment('big-five')}
                         iconColor="text-pink-400"
                         isCompleted={completedAssessments.has('big-five')}
                    />
                    <AssessmentCard 
                        icon={CheckSquare}
                        title="Work Values"
                        description="Define what is most important to you in a career."
                        questions="1 exercise"
                        time="~5 minutes"
                        level="Beginner"
                        onClick={() => onStartAssessment('work-values')}
                        iconColor="text-teal-400"
                        isCompleted={completedAssessments.has('work-values')}
                    />
                    <AssessmentCard 
                        icon={Heart}
                        title="Emotional Intelligence Assessment"
                        description="Assess your emotional intelligence and interpersonal skills."
                        questions="10 questions"
                        time="~10 minutes"
                        level="Intermediate"
                        onClick={() => onStartAssessment('eq')}
                        iconColor="text-red-400"
                        isCompleted={completedAssessments.has('eq')}
                    />
                    <AssessmentCard 
                        icon={BarChart}
                        title="Personal SWOT Analysis"
                        description="Analyze your strengths, weaknesses, opportunities, and threats."
                        questions="8 questions"
                        time="~10 minutes"
                        level="Advanced"
                        onClick={() => onStartAssessment('swot')}
                        iconColor="text-indigo-400"
                        isCompleted={completedAssessments.has('swot')}
                    />
                     <AssessmentCard 
                        icon={Users}
                        title="Situational Judgment Test"
                        description="Test your decision-making in workplace scenarios."
                        questions="8 scenarios"
                        time="~12 minutes"
                        level="Advanced"
                        onClick={() => onStartAssessment('sjt')}
                        iconColor="text-orange-400"
                        isCompleted={completedAssessments.has('sjt')}
                    />
                    <AssessmentCard 
                        icon={Puzzle}
                        title="Cognitive Puzzles"
                        description="Challenge your problem-solving and analytical thinking."
                        questions="5 puzzles"
                        time="~15 minutes"
                        level="Challenging"
                        onClick={() => onStartAssessment('puzzles')}
                        iconColor="text-green-400"
                        isCompleted={completedAssessments.has('puzzles')}
                    />
                </div>
                 {allAssessmentsCompleted && (
                    <Card className="text-center bg-card/80 backdrop-blur-sm border-green-500/50 shadow-lg shadow-green-500/20 p-6 animate-fade-in-up">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-green-500">All Assessments Completed!</CardTitle>
                            <CardDescription>You're ready to unlock your personalized career blueprint.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button size="lg" onClick={onFinalize}>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Analyze All Results
                            </Button>
                        </CardContent>
                    </Card>
                )}


                <div>
                    <h2 className="text-2xl font-bold text-center mb-6">Your Achievements</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                       {achievements.map(ach => (
                          <AchievementCard 
                            key={ach.title}
                            icon={ach.icon}
                            title={ach.title}
                            description={ach.description}
                            isUnlocked={ach.unlocked}
                            iconColor={ach.color}
                          />
                       ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
