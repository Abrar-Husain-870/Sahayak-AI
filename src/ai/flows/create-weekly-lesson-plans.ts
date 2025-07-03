'use server';
/**
 * @fileOverview Generates a weekly lesson plan for a given topic and grade level.
 *
 * - createWeeklyLessonPlan - A function that generates the lesson plan.
 * - CreateWeeklyLessonPlanInput - The input type for the createWeeklyLessonPlan function.
 * - CreateWeeklyLessonPlanOutput - The return type for the createWeeklyLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateWeeklyLessonPlanInputSchema = z.object({
  topic: z.string().describe('The topic of the lesson plan.'),
  gradeLevel: z.string().describe('The grade level for the lesson plan.'),
  language: z.string().describe('The language for the lesson plan.'),
});
export type CreateWeeklyLessonPlanInput = z.infer<typeof CreateWeeklyLessonPlanInputSchema>;

const CreateWeeklyLessonPlanOutputSchema = z.object({
  lessonPlan: z.string().describe('The generated weekly lesson plan.'),
});
export type CreateWeeklyLessonPlanOutput = z.infer<typeof CreateWeeklyLessonPlanOutputSchema>;

export async function createWeeklyLessonPlan(input: CreateWeeklyLessonPlanInput): Promise<CreateWeeklyLessonPlanOutput> {
  return createWeeklyLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createWeeklyLessonPlanPrompt',
  input: {schema: CreateWeeklyLessonPlanInputSchema},
  output: {schema: CreateWeeklyLessonPlanOutputSchema},
  prompt: `You are an experienced teacher creating a weekly lesson plan for the topic "{{topic}}" for grade level "{{gradeLevel}}". The lesson plan should be in "{{language}}".

  The lesson plan should include daily activities and learning objectives.
  Provide detailed and engaging activities that are appropriate for the grade level.
  Format the lesson plan in a clear, easy-to-follow manner.
  Consider diverse learning needs and suggest differentiated activities where possible.
  The lesson plan should be creative, engaging, and easy to understand.
  Include assessments to measure student understanding.
  Include activities that promote critical thinking and problem-solving skills.

  Weekly Lesson Plan:
`,
});

const createWeeklyLessonPlanFlow = ai.defineFlow(
  {
    name: 'createWeeklyLessonPlanFlow',
    inputSchema: CreateWeeklyLessonPlanInputSchema,
    outputSchema: CreateWeeklyLessonPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
