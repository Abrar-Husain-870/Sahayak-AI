'use server';
/**
 * @fileOverview An AI agent that acts as an instant knowledge base.
 *
 * - explainConcept - A function that provides simple, accurate explanations for complex student questions in the local language, complete with easy-to-understand analogies.
 * - ExplainConceptInput - The input type for the explainConcept function.
 * - ExplainConceptOutput - The return type for the explainConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainConceptInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
  language: z.string().describe('The language to provide the explanation in.'),
});
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  explanation: z.string().describe('The simple and accurate explanation of the concept, including analogies.'),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(input: ExplainConceptInput): Promise<ExplainConceptOutput> {
  return explainConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainConceptPrompt',
  input: {schema: ExplainConceptInputSchema},
  output: {schema: ExplainConceptOutputSchema},
  prompt: `You are a helpful AI assistant that provides simple, accurate explanations for complex student questions in the local language, complete with easy-to-understand analogies.

  Question: {{{question}}}
  Language: {{{language}}}

  Provide a clear and concise explanation in the specified language, using analogies to make the concept easier to understand.`,
});

const explainConceptFlow = ai.defineFlow(
  {
    name: 'explainConceptFlow',
    inputSchema: ExplainConceptInputSchema,
    outputSchema: ExplainConceptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
