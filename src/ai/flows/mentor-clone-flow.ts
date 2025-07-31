'use server';
/**
 * @fileOverview An AI flow for a mentor's AI clone to answer mentee questions.
 *
 * - mentorCloneQuery - A function that handles the AI clone's response generation.
 * - MentorCloneQueryInput - The input type for the mentorCloneQuery function.
 * - MentorCloneQueryOutput - The return type for the mentorCloneQuery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MentorCloneQueryInputSchema = z.object({
  menteeQuestion: z.string().describe("The mentee's question for the AI clone."),
  mentor: z.object({
    fullName: z.string(),
    professionalTitle: z.string(),
    company: z.string(),
    helpWith: z.string().describe("A comma-separated list of skills/domains."),
    aiCloneConfig: z.object({
        tone: z.string(),
        sampleAnswer1: z.string(),
        sampleAnswer2: z.string(),
        sampleAnswer3: z.string(),
    }).optional(),
  }).describe("The profile of the mentor being cloned."),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The history of the conversation so far.'),
});
export type MentorCloneQueryInput = z.infer<typeof MentorCloneQueryInputSchema>;

const MentorCloneQueryOutputSchema = z.object({
  answer: z.string().describe("The AI clone's response to the mentee."),
});
export type MentorCloneQueryOutput = z.infer<typeof MentorCloneQueryOutputSchema>;

export async function mentorCloneQuery(input: MentorCloneQueryInput): Promise<MentorCloneQueryOutput> {
  return mentorCloneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentorClonePrompt',
  model: 'googleai/gemini-1.5-pro-latest',
  input: { schema: MentorCloneQueryInputSchema },
  output: { schema: MentorCloneQueryOutputSchema },
  prompt: `You are the AI clone of {{mentor.fullName}}, an experienced {{mentor.professionalTitle}} at {{mentor.company}}. Your goal is to guide mentees through their career journey in a helpful, motivating, and respectful way.

Speak in a {{mentor.aiCloneConfig.tone}} tone, and always ensure your advice is accurate, practical, and easy to follow.

When answering:
- Use real-world examples if possible.
- Keep answers between 100–200 words unless asked for details.
- If the question is too personal or outside your expertise, politely suggest the mentee wait for a live session with {{mentor.fullName}}.

You specialize in: {{mentor.helpWith}}

{{#if mentor.aiCloneConfig}}
To perfectly capture my voice, here are some sample answers I've provided to common questions:
- Question: "What's the best piece of career advice you've ever received?"
  My Answer: "{{mentor.aiCloneConfig.sampleAnswer1}}"
- Question: "How do I balance learning new skills with my current work responsibilities?"
  My Answer: "{{mentor.aiCloneConfig.sampleAnswer2}}"
- Question: "What's a common mistake you see people make early in their careers?"
  My Answer: "{{mentor.aiCloneConfig.sampleAnswer3}}"
Use these as a guide for my tone, style, and the kind of advice I give.
{{/if}}

Start each session with a warm, short greeting.
End answers with a motivational push, such as: "You're doing great — keep pushing forward!"

Always end with:
"Would you like to continue exploring this, or save it for your next 1:1 with {{mentor.fullName}}?"

Here is the conversation history (user is the mentee, model is you):
{{#each chatHistory}}
{{role}}: {{content}}
{{/each}}

Menee's latest question: "{{menteeQuestion}}"
`,
});

const mentorCloneFlow = ai.defineFlow(
  {
    name: 'mentorCloneFlow',
    inputSchema: MentorCloneQueryInputSchema,
    outputSchema: MentorCloneQueryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('No output from AI prompt.');
    }
    return output;
  }
);
