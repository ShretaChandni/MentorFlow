
"use client";

import { useState } from "react";
import { PersonalityTest } from "@/components/app/personality-test";
import { InnerBeingLandingPage } from "@/components/app/innerbeing-landing-page";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { GenerateInsightsOutput } from '@/ai/flows/generate-insights';

export default function MenteeQuizPage() {
  const router = useRouter();
  const { user, refetchUserData } = useAuth();
  const { toast } = useToast();

  const handleGoBack = () => {
    // If a user is logged in, go to dashboard, otherwise go to landing.
    if (user) {
        router.push("/dashboard");
    } else {
        router.push("/");
    }
  }

  const handleTestComplete = async (initialInsights: any, allData: any) => {
    // Save all data to localStorage to be picked up by the results page
    if (typeof window !== 'undefined') {
        localStorage.setItem('quizInitialInsights', JSON.stringify(initialInsights));
        localStorage.setItem('quizAllData', JSON.stringify(allData));
    }
    
    // If the user is logged in, save their initial results.
    if (user) {
        try {
            const menteeDocRef = doc(firestore, 'mentees', user.uid);
            await updateDoc(menteeDocRef, {
                personalityInsights: initialInsights,
                quizCompleted: true, // Mark quiz as completed
            });
            
            toast({
                title: "Insights Saved!",
                description: "Your personality results have been saved to your profile.",
            });
            refetchUserData(); // Update user data in context
        } catch (error) {
            console.error("Error saving insights:", error);
             // This might fail if the doc doesn't exist yet, which is okay for a test user.
             // We'll just log it and not bother the user with a toast.
        }
    }
    
    // Redirect to the new results page
    router.push('/quiz-results');
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PersonalityTest onBack={handleGoBack} onComplete={handleTestComplete} />
    </div>
  );
}
