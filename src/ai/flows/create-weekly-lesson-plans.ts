'use server';
/**
 * @fileOverview Generates a weekly lesson plan for a given topic and grade level.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * A robust, multi-stage function to extract and sanitize JSON from a raw AI string.
 * It's designed to handle common AI-induced formatting errors.
 */
function extractAndParseJson(str: string): string {
  let jsonString = str;

  // 1. Find the start and end of the outermost JSON object.
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    console.warn('Could not find a valid JSON object within the AI response. Returning raw text.');
    return str; // Return original string for fallback display.
  }
  
  jsonString = str.substring(firstBrace, lastBrace + 1);

  // 2. Aggressively clean the JSON string to remove common syntax errors.
  // This regex removes trailing commas from objects and arrays.
  const cleanedJsonString = jsonString.replace(/,(?=\s*[}\]])/g, '');

  // 3. Attempt to parse the cleaned JSON.
  try {
    const parsed = JSON.parse(cleanedJsonString);
    // Return the beautified, validated JSON string.
    return JSON.stringify(parsed, null, 2);
  } catch (initialError) {
    // 4. If initial parsing fails, try an even more aggressive cleaning.
    console.warn('Initial JSON parsing failed, attempting more aggressive cleaning.', (initialError as Error).message);
    
    // This can help with unescaped newlines inside strings, a common issue.
    const noNewlines = cleanedJsonString.replace(/\n/g, ' ').replace(/\r/g, ' ');
    
    try {
      const parsed = JSON.parse(noNewlines);
      console.log('Successfully parsed JSON after aggressive cleaning.');
      return JSON.stringify(parsed, null, 2);
    } catch (finalError) {
      console.error('FATAL: Failed to parse lesson plan JSON even after aggressive cleaning.', {
        error: (finalError as Error).message,
        originalString: str,
      });
      // If all parsing fails, return the original full string.
      // The frontend will display this raw text as a fallback.
      return str;
    }
  }
}

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
  input: { schema: CreateWeeklyLessonPlanInputSchema },
  output: { schema: CreateWeeklyLessonPlanOutputSchema },
  prompt: `You are an API that returns a weekly lesson plan for the topic "{{topic}}" for grade level "{{gradeLevel}}" in "{{language}}".

Your response MUST be a single, valid, well-formed JSON object and nothing else.
Do NOT include any explanatory text, markdown, or any characters outside of the JSON object.

The JSON object should represent a complete weekly lesson plan. It must include:
- A 'title' (string)
- A 'gradeLevel' (string)
- A 'subject' (string)
- A 'weekOverview' (string)
- 'weekObjectives' (array of strings)
- 'materials' (array of strings)
- 'dailyPlan' (array of objects), where each object has:
  - 'day' (string, e.g., "Monday")
  - 'topic' (string)
  - 'learningObjectives' (array of strings)
  - 'activities' (array of strings)
  - 'materials' (array of strings)
  - 'assessment' (string or array of strings)
  - 'differentiation' (object with 'support' and 'challenge' strings)
- 'assessment' (object with 'formative' and 'summative' arrays of strings)

Generate the JSON object now.`,
});

const createWeeklyLessonPlanFlow = ai.defineFlow(
  {
    name: 'createWeeklyLessonPlanFlow',
    inputSchema: CreateWeeklyLessonPlanInputSchema,
    outputSchema: CreateWeeklyLessonPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output?.lessonPlan) {
      throw new Error('Failed to generate lesson plan from AI.');
    }

    const cleanedLessonPlan = extractAndParseJson(output.lessonPlan);

    return { lessonPlan: cleanedLessonPlan };
  }
);
