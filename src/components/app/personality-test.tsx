
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Circle, Square, Triangle, Hexagon, Users, Brain, Swords, Briefcase, Palette, ArrowLeft, ArrowRight, Loader2, PlayCircle, Star, Home } from "lucide-react";

import { generateInsights, GenerateInsightsInput, GenerateInsightsOutput } from '@/ai/flows/generate-insights';
import { TRAITS, type TraitId, QUESTIONS, QUESTION_CATEGORIES, CategoryId, Question } from "@/lib/traits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InnerBeingLogo } from "@/components/icons/innerbeing-logo";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { InnerBeingLandingPage } from "./innerbeing-landing-page";
import { ChooseAssessment } from "./choose-assessment";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const formSchema = z.object({
  username: z.string().min(1, "Please enter your name to begin."),
  answers: z.array(z.any()),
  dreamCareer: z.string().optional(),
  ageGroup: z.string().optional(),
  education: z.string().optional(),
  location: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;
type Step = 'innerbeing-landing' | 'assessment-hub' | 'in-progress' | 'loading' | 'results';
type AnimationDirection = 'right' | 'left';

const SHAPE_MAP = {
    circle: <Circle className="w-8 h-8" />,
    square: <Square className="w-8 h-8" />,
    triangle: <Triangle className="w-8 h-8" />,
    hexagon: <Hexagon className="w-8 h-8" />,
};

const CLICK_SOUND_URL = 'https://firebasestorage.googleapis.com/v0/b/genkit-llm-3e61c.appspot.com/o/prototyper%2Fclick.mp3?alt=media&token=87a79227-047b-4022-8613-21175628e833';
const CELEBRATION_SOUND_URL = 'https://firebasestorage.googleapis.com/v0/b/genkit-llm-3e61c.appspot.com/o/prototyper%2Fcelebration.mp3?alt=media&token=5b355a29-b631-4b7e-927b-2311311b81b2';


interface QuestionRendererProps {
  question: Question;
  questionIndex: number;
  isFirstQuestionInCategory: boolean;
  totalQuestions: number;
  control: any;
  watch: any;
  setValue: any;
  animationDirection: AnimationDirection;
  onNext: () => void;
  onPrev: () => void;
  onBackToHub: () => void;
}

function QuestionRenderer({
  question,
  questionIndex,
  isFirstQuestionInCategory,
  totalQuestions,
  control,
  watch,
  setValue,
  animationDirection,
  onNext,
  onPrev,
  onBackToHub,
}: QuestionRendererProps) {
  const progress = ((questionIndex + 1) / totalQuestions) * 100;
  const CategoryIcon = QUESTION_CATEGORIES[question.category]?.icon || Star;
  
  // Specific logic for points allocation question
  const [points, setPoints] = useState<Record<string, number>>({});
  const [totalPoints, setTotalPoints] = useState(0);

  const currentAnswerIndex = QUESTIONS.indexOf(question);
  const watchedAnswers = watch(`answers.${currentAnswerIndex}`);

  useEffect(() => {
      if (question.type === 'points_allocation') {
          const initialPoints = watchedAnswers || {};
          setPoints(initialPoints);
          const sum = Object.values(initialPoints).reduce((acc: number, val: unknown) => acc + (typeof val === 'number' ? val : 0), 0);
          setTotalPoints(sum);
      }
  }, [watchedAnswers, question.type]);

  const handlePointsChange = (id: string, value: number) => {
      const newPoints = { ...points, [id]: value };
      const newTotal = Object.values(newPoints).reduce((acc, val) => acc + val, 0);

      if (newTotal > 100) {
          // Don't allow update if it exceeds 100
          return;
      }
      setPoints(newPoints);
      setTotalPoints(newTotal);
      setValue(`answers.${currentAnswerIndex}`, newPoints);
  };
  
  return (
    <div className={cn("w-full animate-fade-in-up", 
        animationDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
    )}>
        <Card className="w-full max-w-4xl mx-auto shadow-lg shadow-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="p-2">
                <Progress value={progress} className="h-2" />
            </div>
            <div className="grid md:grid-cols-2">
                 <div className="p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <Badge variant="outline" className="text-sm font-semibold">
                                <CategoryIcon className="w-4 h-4 mr-2" />
                                {QUESTION_CATEGORIES[question.category]?.name}
                            </Badge>
                             <Button variant="ghost" size="sm" onClick={onBackToHub}>
                                <Home className="mr-2 h-4 w-4" />
                                Back to Hub
                            </Button>
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-bold leading-tight">
                            {question.text}
                        </CardTitle>
                    </div>
                     <div className="mt-8 space-y-6">
                        <Controller
                            name={`answers.${QUESTIONS.indexOf(question)}`}
                            control={control}
                            defaultValue={question.type === 'slider' ? [4] : (question.type === 'points_allocation' ? {} : '')}
                            render={({ field }) => (
                                <>
                                    {question.type === 'slider' && (
                                         <div className="space-y-4">
                                            <Slider
                                                min={1}
                                                max={7}
                                                step={1}
                                                value={Array.isArray(field.value) ? field.value : [4]}
                                                onValueChange={(val) => field.onChange(val)}
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Strongly Disagree</span>
                                                <span>Neutral</span>
                                                <span>Strongly Agree</span>
                                            </div>
                                        </div>
                                    )}
                                     {question.type === 'multiple_choice' && question.options && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {question.options.map(option => (
                                                <Button
                                                    key={option.id}
                                                    variant={field.value === option.id ? "default" : "outline"}
                                                    onClick={() => field.onChange(option.id)}
                                                    className="h-auto p-4 flex flex-col gap-2 items-center justify-center"
                                                >
                                                    {option.type === 'shape' ? 
                                                        SHAPE_MAP[option.content as keyof typeof SHAPE_MAP] : 
                                                        <span className="text-sm font-semibold">{option.content}</span>
                                                    }
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                    {question.type === 'text_input' && (
                                        <Textarea
                                            placeholder="Your answer here..."
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            className="min-h-[100px]"
                                        />
                                    )}
                                    {question.type === 'points_allocation' && question.options && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-muted p-2 rounded-lg">
                                                <span className="text-sm font-semibold">Points Remaining</span>
                                                <Badge className="text-lg">{100 - totalPoints}</Badge>
                                            </div>
                                            {question.options.map(option => (
                                                <div key={option.id} className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        {option.icon && <option.icon className="w-5 h-5 text-muted-foreground" />}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <label className="font-semibold cursor-help">{option.content}</label>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{option.description}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <span className="ml-auto font-bold text-primary w-10 text-right">{points[option.id] || 0}</span>
                                                    </div>
                                                    <Slider
                                                        value={[points[option.id] || 0]}
                                                        onValueChange={(val) => handlePointsChange(option.id, val[0])}
                                                        max={100}
                                                        step={5}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        />
                         <div className="flex justify-between items-center pt-4">
                             <Button variant="ghost" onClick={onPrev} disabled={isFirstQuestionInCategory}>
                                <ArrowLeft className="mr-2" /> Previous
                            </Button>
                             <Button onClick={onNext} disabled={question.type === 'points_allocation' && totalPoints !== 100}>
                                {questionIndex === totalQuestions - 1 ? 'Finish Assessment' : 'Next'} <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="relative min-h-[300px] md:min-h-full">
                    <Image src={question.imageUrl} alt="Question visual representation" layout="fill" className="object-cover" data-ai-hint="abstract illustration" />
                </div>
            </div>
        </Card>
    </div>
  )
}


interface PersonalityTestProps {
    onBack: () => void;
    onComplete: (initialInsights: GenerateInsightsOutput, allData: GenerateInsightsInput) => void;
}

export function PersonalityTest({ onBack, onComplete }: PersonalityTestProps) {
  const { userData } = useAuth();
  const [step, setStep] = useState<Step>('innerbeing-landing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('right');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
  const [currentAssessmentId, setCurrentAssessmentId] = useState<CategoryId | null>(null);
  const [completedAssessments, setCompletedAssessments] = useState<Set<CategoryId>>(new Set());
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [xp, setXp] = useState(0);
  const level = completedAssessments.size + 1;
  const { toast } = useToast();

  const { control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      answers: Array(QUESTIONS.length).fill(null),
      dreamCareer: "",
      ageGroup: '',
      education: '',
      location: ''
    },
  });

  useEffect(() => {
    if (userData?.fullName) {
      setValue('username', userData.fullName);
    } else {
      setValue('username', 'Explorer');
    }
  }, [userData, setValue]);
  
  const playAudio = useCallback((audioUrl: string) => {
    if (isAudioOn) {
      try {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => console.error("Audio playback failed:", e));
      } catch (e) {
        console.error("Failed to create audio object:", e);
      }
    }
  }, [isAudioOn]);


  const username = watch("username");
  
  const handleStartAssessment = (assessmentId: CategoryId) => {
    setCurrentAssessmentId(assessmentId);
    const firstQuestionIndex = QUESTIONS.findIndex(q => q.category === assessmentId);
    if (firstQuestionIndex !== -1) {
        setCurrentQuestionIndex(firstQuestionIndex);
        setStep('in-progress');
    } else {
        toast({
            variant: "destructive",
            title: "Assessment Not Found",
            description: "This assessment has no questions yet."
        })
    }
  };

  const currentQuestions = currentAssessmentId ? QUESTIONS.filter(q => q.category === currentAssessmentId) : [];
  
  const handleNextQuestion = async () => {
    playAudio(CLICK_SOUND_URL);
    const questionToValidate = QUESTIONS[currentQuestionIndex];
    if (!questionToValidate) return;

    const isValid = await trigger(`answers.${QUESTIONS.indexOf(questionToValidate)}`);
    if (!isValid) return;

    setXp(prev => prev + 100);
    setAnimationDirection('right');
    
    if (currentQuestionIndex < QUESTIONS.length - 1 && QUESTIONS[currentQuestionIndex + 1].category === currentAssessmentId) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // End of the current assessment
      if (currentAssessmentId) {
        setCompletedAssessments(prev => new Set(prev).add(currentAssessmentId));
        playAudio(CELEBRATION_SOUND_URL);
      }
      setStep('assessment-hub');
    }
  };

  const handlePrevQuestion = () => {
    playAudio(CLICK_SOUND_URL);
    setAnimationDirection('left');
    
    if (currentAssessmentId) {
      const firstQuestionIndex = QUESTIONS.findIndex(q => q.category === currentAssessmentId);
      if (currentQuestionIndex > firstQuestionIndex) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    }
  };
  
  const handleBackToHub = () => {
    setStep('assessment-hub');
    setCurrentAssessmentId(null);
  }

  const onSubmit = async (data: FormData) => {
    setStep('loading');
    const traitScores: { [key in TraitId]?: number } = {};
    const answersByCategory: Record<CategoryId, { question: string, answer: any }[]> = {
        'holland-code': [], 'big-five': [], 'eq': [], 'swot': [], 'sjt': [], 'puzzles': [], 'aptitude': [], 'work-values': []
    };

    QUESTIONS.forEach((q, i) => {
      let answer = data.answers[i];
      if (answer === null) return;
      
      answersByCategory[q.category].push({ question: q.text, answer });

      if (q.type === 'slider') {
        const score = q.reversed ? 8 - answer[0] : answer[0];
        traitScores[q.trait] = (traitScores[q.trait] || 0) + (score / 7 * 14.28);
      } else if (q.type === 'multiple_choice' && q.answer) {
        if (answer === q.answer) {
            traitScores[q.trait] = (traitScores[q.trait] || 0) + 25;
        }
      }
    });

    const finalTraitScores: { [key: string]: number } = {};
    Object.entries(traitScores).forEach(([trait, score]) => {
      finalTraitScores[trait] = Math.min(100, Math.round(score));
    });

    try {
        const allDataForInsights: GenerateInsightsInput = {
            traitScores: finalTraitScores,
            answers: QUESTIONS.map((q, i) => ({
                question: q.text,
                answer: data.answers[i],
                category: q.category,
            })),
            isFinalAnalysis: false
        };
        const initialInsights = await generateInsights(allDataForInsights);
        onComplete(initialInsights, allDataForInsights);
    } catch (error: any) {
        console.error("Error generating insights:", error);
        toast({ variant: 'destructive', title: "Insight Generation Failed", description: error.message });
        setStep('assessment-hub');
    }
  };
  
  const renderContent = () => {
    switch(step) {
      case 'innerbeing-landing':
        return (
             <InnerBeingLandingPage onStartTest={() => setStep('assessment-hub')} onGoBack={onBack} />
        )
      case 'assessment-hub':
        return (
           <ChooseAssessment
                onStartAssessment={handleStartAssessment}
                onBack={() => setStep('innerbeing-landing')}
                username={username || userData?.fullName || 'Explorer'}
                completedAssessments={completedAssessments}
                onFinalize={() => handleSubmit(onSubmit)()}
                isAudioOn={isAudioOn}
                onAudioToggle={setIsAudioOn}
                xp={xp}
                level={level}
            />
        )
      case 'in-progress':
        const question = QUESTIONS[currentQuestionIndex];
        if (!question) {
            handleBackToHub();
            return null;
        }
        
        const firstQuestionIndexForCategory = currentAssessmentId ? QUESTIONS.findIndex(q => q.category === currentAssessmentId) : -1;
        const isFirst = currentQuestionIndex === firstQuestionIndexForCategory;

        const localQuestionIndex = currentQuestions.findIndex(q => q.id === question.id);
        
        return (
            <QuestionRenderer 
                key={question.id}
                question={question}
                questionIndex={localQuestionIndex}
                isFirstQuestionInCategory={isFirst}
                totalQuestions={currentQuestions.length}
                control={control}
                watch={watch}
                setValue={setValue}
                animationDirection={animationDirection}
                onNext={handleNextQuestion}
                onPrev={handlePrevQuestion}
                onBackToHub={handleBackToHub}
            />
        );
      case 'loading':
        return (
            <div className="text-center space-y-4">
                <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                <h2 className="text-2xl font-bold">Analyzing Your Results...</h2>
                <p className="text-muted-foreground">Your personalized career blueprint is being generated.</p>
            </div>
        )
      default:
        return null;
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col min-h-screen justify-center overflow-x-hidden">
        {renderContent()}
    </div>
  );
}
