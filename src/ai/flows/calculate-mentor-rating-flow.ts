
'use server';
/**
 * @fileOverview An AI flow for calculating a mentor's rating.
 *
 * - calculateMentorRating - A function that handles the mentor rating process.
 * - CalculateMentorRatingInput - The input type for the calculateMentorRating function.
 * - CalculateMentorRatingOutput - The return type for the calculateMentorRating function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define a list of prestigious companies. This could be expanded or moved to a database.
const prestigiousCompanies = [
    'Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'Stripe', 'Airbnb', 
    'Spotify', 'Vercel', 'HubSpot', 'ICON plc'
];

const CalculateMentorRatingInputSchema = z.object({
  company: z.string().describe("The mentor's current or most recent company."),
  experience: z.string().describe("A string representing the mentor's years of experience, e.g., '10+ years'."),
  bio: z.string().describe("The mentor's professional biography."),
  demand: z.number().describe("A numerical value representing mentee demand, like number of connection requests."),
});
export type CalculateMentorRatingInput = z.infer<typeof CalculateMentorRatingInputSchema>;

const CalculateMentorRatingOutputSchema = z.object({
  rating: z.number().min(3.5).max(5.0).describe("The calculated mentor rating, from 3.5 to 5.0."),
  justification: z.string().describe("A brief justification for the calculated rating."),
});
export type CalculateMentorRatingOutput = z.infer<typeof CalculateMentorRatingOutputSchema>;

export async function calculateMentorRating(input: CalculateMentorRatingInput): Promise<CalculateMentorRatingOutput> {
  // Pre-process the input to provide stronger signals to the model.
  const isPrestigious = prestigiousCompanies.some(c => input.company.toLowerCase().includes(c.toLowerCase()));
  const parsedExperience = parseInt(input.experience.replace(/\D/g, ''), 10) || 0;

  const augmentedInput = {
      ...input,
      isPrestigious,
      parsedExperience,
  };

  return calculateMentorRatingFlow(augmentedInput);
}

const prompt = ai.definePrompt({
  name: 'calculateMentorRatingPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: CalculateMentorRatingInputSchema.extend({ isPrestigious: z.boolean(), parsedExperience: z.number() }) },
  output: { schema: CalculateMentorRatingOutputSchema },
  prompt: `You are an expert system for evaluating and rating professional mentors on a scale of 3.5 to 5.0.
Your task is to calculate a rating for a mentor based on the provided profile information.

**Rating Guidelines:**
- **Base Rating:** Start all mentors at a base of 3.5.
- **Experience:**
    - 0-2 years: +0.2
    - 3-5 years: +0.4
    - 6-9 years: +0.6
    - 10-14 years: +0.8
    - 15+ years: +1.0
- **Prestigious Company:** If 'isPrestigious' is true, add +0.3. A prestigious company is a well-known, top-tier tech or industry leader.
- **Demand:** If 'demand' is over 50, add +0.1. If over 100, add +0.2.
- **Bio Quality:** Briefly analyze the bio. If it is well-written, clear, and shows strong expertise, add up to +0.2.
- **Final Cap:** The final rating cannot exceed 5.0.

Analyze the following mentor profile and provide a rating and a brief justification.

**Mentor Profile:**
- Company: {{{company}}} (Is Prestigious: {{{isPrestigious}}})
- Experience: {{{experience}}} (Parsed Years: {{{parsedExperience}}})
- Demand (Connection Requests): {{{demand}}}
- Bio: {{{bio}}}

Calculate the final rating and provide a short justification based on the factors.
`,
});

const calculateMentorRatingFlow = ai.defineFlow(
  {
    name: 'calculateMentorRatingFlow',
    inputSchema: CalculateMentorRatingInputSchema.extend({ isPrestigious: z.boolean(), parsedExperience: z.number() }),
    outputSchema: CalculateMentorRatingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
