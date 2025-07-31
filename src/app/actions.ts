'use server';

import { generateInsights, GenerateInsightsInput, GenerateInsightsOutput } from '@/ai/flows/generate-insights';
import { mentorCloneQuery, MentorCloneQueryInput, MentorCloneQueryOutput } from '@/ai/flows/mentor-clone-flow';
import { ai } from '@/ai/genkit';
import { firestore } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';


export async function handleMentorCloneQuery(input: MentorCloneQueryInput): Promise<MentorCloneQueryOutput> {
  try {
    const result = await mentorCloneQuery(input);
    if (!result || !result.answer) {
      throw new Error('Received invalid response from AI Assistant');
    }
    return result;
  } catch (error) {
    console.error('Error getting response from AI assistant:', error);
    throw new Error('Failed to get response from AI Assistant. The model may be temporarily unavailable.');
  }
}


export async function saveQuizResults(userId: string, results: any): Promise<{success: boolean}> {
    if (!userId || !results) {
        throw new Error("Invalid user ID or results provided.");
    }

    try {
        const menteeDocRef = doc(firestore, 'mentees', userId);
        const { answers, traitScores, ...personalityInsights } = results;

        const dataToUpdate: any = {
            personalityInsights,
            quizCompleted: true,
        };

        if (answers) {
            dataToUpdate.answers = answers;
        }
        if (traitScores) {
            dataToUpdate.traitScores = traitScores;
        }

        await updateDoc(menteeDocRef, dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error("Error saving quiz results to Firestore:", error);
        throw new Error("Could not save your quiz results to your profile.");
    }
}
