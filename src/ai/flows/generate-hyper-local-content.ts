// src/ai/flows/generate-hyper-local-content.ts
'use server';
/**
 * @fileOverview Generates hyper-local content based on teacher's request in the local language.
 *
 * - generateHyperLocalContent - A function that generates hyper-local content.
 * - GenerateHyperLocalContentInput - The input type for the generateHyperLocalContent function.
 * - GenerateHyperLocalContentOutput - The return type for the generateHyperLocalContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHyperLocalContentInputSchema = z.object({
  language: z.string().describe('The local language for content generation.'),
  request: z.string().describe('The teacher\u0027s request for content generation.'),
});
export type GenerateHyperLocalContentInput = z.infer<typeof GenerateHyperLocalContentInputSchema>;

const GenerateHyperLocalContentOutputSchema = z.object({
  content: z.string().describe('The generated hyper-local content.'),
});
export type GenerateHyperLocalContentOutput = z.infer<typeof GenerateHyperLocalContentOutputSchema>;

export async function generateHyperLocalContent(
  input: GenerateHyperLocalContentInput
): Promise<GenerateHyperLocalContentOutput> {
  return generateHyperLocalContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHyperLocalContentPrompt',
  input: {schema: GenerateHyperLocalContentInputSchema},
  output: {schema: GenerateHyperLocalContentOutputSchema},
  prompt: `You are an expert in generating hyper-local content for teachers in India.

  A teacher will make a request in their local language, and you will generate simple, culturally relevant content.

  Language: {{{language}}}
  Request: {{{request}}}

  Content:`, // Removed triple curly braces for the Content field
});

const generateHyperLocalContentFlow = ai.defineFlow(
  {
    name: 'generateHyperLocalContentFlow',
    inputSchema: GenerateHyperLocalContentInputSchema,
    outputSchema: GenerateHyperLocalContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
