
'use server';

/**
 * @fileOverview Generates personalized insights and career counseling based on trait scores.
 *
 * - generateInsights - A function that generates insights based on the provided trait scores.
 * - GenerateInsightsInput - The input type for the generateInsights function.
 * - GenerateInsightsOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInsightsInputSchema = z.object({
  traitScores: z
    .record(z.number())
    .describe('A record of trait scores for different traits.'),
  answers: z.array(z.object({
    question: z.string(),
    answer: z.any(),
    category: z.string(),
  })).describe('An array of questions, categories, and the user\'s answers (slider: 1-7, mcq: option_id, text: string).'),
  dreamCareer: z.string().optional().describe('The user\'s stated dream career.'),
  isFinalAnalysis: z.boolean().optional().describe('Flag to determine if this is the final, more detailed analysis.')
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

const GenerateInsightsOutputSchema = z.object({
  forwardDevelopment: z.object({
    archetype: z.string().describe('The user\'s professional archetype based on their test results (e.g., "The Creative Strategist").'),
    recommendedCareer: z.object({
        title: z.string().describe("The title of the primary recommended career path based on their traits."),
        description: z.string().describe("A detailed description of why this career path is a good fit.")
    }).describe("The main career path recommendation based on their test results."),
    threeYearPlan: z.array(z.string()).describe("A 3-step, actionable plan for the next three years for the recommended career path, including specific platforms or courses (e.g., Coursera, Udemy)."),
    traitScores: z.any().optional().describe('A record of trait scores for different traits. This should be passed through from the input.'),
  }).describe("Guidance based on what the user's traits suggest is a perfect fit."),
  reverseDevelopment: z.object({
    isFeasible: z.boolean().describe("Whether the user's dream career is a feasible goal based on their traits."),
    analysis: z.string().describe("An analysis of how the user's traits align with their dream career, highlighting strengths and weaknesses."),
    threeYearPlan: z.array(z.string()).describe("A 3-step, actionable plan to bridge the skill gap for their dream career, including specific platforms or courses."),
  }).optional().describe("Guidance on how to achieve the user's stated dream career, only present if a dream career was provided."),
  quote: z.string().describe('A tailored, inspiring quote that sounds like professional wisdom.'),
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  return generateInsightsFlow(input);
}

const insightsPrompt = ai.definePrompt({
  name: 'insightsPrompt',
  model: 'googleai/gemini-1.5-pro-latest',
  input: {schema: GenerateInsightsInputSchema},
  output: {schema: GenerateInsightsOutputSchema},
  prompt: `You are an expert career counselor for graduating students. Your task is to provide two distinct career development paths based on a user's psychometric test results and their stated dream career. The tone should be professional, encouraging, and highly specific.

Analyze the following user data:

**1. Quantitative Trait Scores (0-100 scale):**
{{#each traitScores}}
- {{@key}}: {{this}}
{{/each}}

**2. User's Stated Dream Career:**
{{#if dreamCareer}}
"{{{dreamCareer}}}"
{{else}}
Not provided.
{{/if}}

Based on this data, provide the following in JSON format:

**Part A: Forward-Focused Development (Based on Test Results)**
This path should identify the ideal career based SOLELY on the user's test results.

1.  **archetype**: Bestow a professional archetype that captures the user's core strengths (e.g., "The Strategic Innovator," "The Empathetic Builder").
2.  **recommendedCareer**:
    *   **title**: Identify the single best career path for the user from the test. Be creative and specific (e.g., 'AI Prompt Engineer,' 'Sustainable Product Designer,' 'Commercial Drone Pilot').
    *   **description**: Provide a detailed explanation of *why* this career is an excellent match, referencing their specific trait scores (e.g., "Your high score in Creativity, combined with your analytical abilities, suggests...").
3.  **threeYearPlan**: Create a 3-step, actionable plan for the user to pursue this recommended career. Each step should be for one year and suggest popular, credible online platforms or courses (e.g., "Year 1: Master visual storytelling by completing 'The Complete Videography Course' on Udemy and build a portfolio on Behance.").
4.  **traitScores**: Pass through the original traitScores object here.

{{#if dreamCareer}}
**Part B: Reverse-Focused Development (Based on Dream Career)**
This path is mandatory because the user has provided a dreamCareer.

1.  **isFeasible**: Analyze the user's test results. Is their dream career a realistic goal? (true/false).
2.  **analysis**: Provide an honest analysis of how the user's traits align with their dream career. What are their biggest strengths for this path? What are the most significant skill gaps or personality misalignments they need to address?
3.  **threeYearPlan**: Create a 3-step, actionable plan specifically designed to bridge the gaps identified in your analysis and help them achieve their dream career. Suggest specific, credible online courses or resources (like from Coursera, Udemy, etc.).
{{/if}}

**Part C: Inspirational Quote**
1.  **quote**: Provide an inspiring quote about career development that aligns with the user's archetype.
`,
});

const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: GenerateInsightsOutputSchema,
  },
  async (input) => {
    // Create a mutable copy of the input to avoid modifying the original object.
    const promptInput = { ...input };

    // If this is the initial analysis (not the final custom plan),
    // we should not send the dreamCareer to the prompt, even if it's an empty string.
    // This ensures the AI only generates Part A.
    if (!promptInput.isFinalAnalysis) {
      delete (promptInput as Partial<GenerateInsightsInput>).dreamCareer;
    }

    const { output } = await insightsPrompt(promptInput);
    
    if (!output) {
      throw new Error('Failed to generate insights from the AI model.');
    }
    
    // Ensure traitScores are passed through in the final output
    if (!output.forwardDevelopment.traitScores) {
        output.forwardDevelopment.traitScores = input.traitScores;
    }

    return output;
  }
);
