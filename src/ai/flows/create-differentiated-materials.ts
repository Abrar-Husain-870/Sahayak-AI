'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating differentiated worksheets from a textbook page image.
 * This version uses a robust text-parsing strategy instead of relying on the AI to generate perfect JSON.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateDifferentiatedMaterialsInputSchema = z.object({
  textbookPageImage: z
    .string()
    .describe(
      "A photo of a textbook page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  gradeLevels: z
    .string()
    .describe("Comma separated list of grade levels to create worksheets for. Example: '1, 2, 3'"),
  language: z.string().describe('The language of the worksheets to be generated.'),
});
export type CreateDifferentiatedMaterialsInput = z.infer<typeof CreateDifferentiatedMaterialsInputSchema>;

const CreateDifferentiatedMaterialsOutputSchema = z.object({
  differentiatedMaterials: z.string().describe('The generated differentiated materials as a JSON string.'),
});
export type CreateDifferentiatedMaterialsOutput = z.infer<typeof CreateDifferentiatedMaterialsOutputSchema>;

export async function createDifferentiatedMaterials(
  input: CreateDifferentiatedMaterialsInput
): Promise<CreateDifferentiatedMaterialsOutput> {
  return createDifferentiatedMaterialsFlow(input);
}

const createDifferentiatedMaterialsPrompt = ai.definePrompt(
  {
    name: 'createDifferentiatedMaterialsPrompt',
    input: { schema: CreateDifferentiatedMaterialsInputSchema },
    // No output schema is defined, so Genkit will return the raw string from the AI.
    prompt: `You are an expert teacher creating differentiated worksheets.
    You will receive an image of a textbook page, a list of grade levels, and a language.
    Your task is to generate a worksheet for EACH grade level.

    Textbook Page: {{media url=textbookPageImage}}
    Grade Levels: {{{gradeLevels}}}
    Language: {{{language}}}

    Follow these instructions EXACTLY:
    1. For each grade level, you will create one block of text.
    2. The first line of the block MUST be the grade level number ONLY. For example: 10
    3. The rest of the block is the worksheet content for that grade level, in the specified language ({{{language}}}).
    4. You MUST separate each grade level's block with the exact delimiter on its own line:
    _!_!_!_

    Example for grade levels '9, 10':

    9
    Worksheet content for 9th grade goes here. It can contain any characters, quotes like "this", and multiple lines.
    _!_!_!_
    10
    Worksheet content for 10th grade goes here.

    Do NOT output JSON. Do NOT use markdown. Follow the format precisely.
    `,
  }
);

const createDifferentiatedMaterialsFlow = ai.defineFlow(
  {
    name: 'createDifferentiatedMaterialsFlow',
    inputSchema: CreateDifferentiatedMaterialsInputSchema,
    outputSchema: CreateDifferentiatedMaterialsOutputSchema,
  },
  async (input) => {
    // The prompt returns a GenerateResponse object. We need to get the text from it.
    const response = await createDifferentiatedMaterialsPrompt(input);
    const rawAiOutput = response.text;

    if (!rawAiOutput) {
      throw new Error('Failed to generate differentiated materials from AI.');
    }

    const separator = '_!_!_!_';
    const materials: { gradeLevel: string; worksheetContent: string }[] = [];
    const blocks = rawAiOutput.split(separator);

    for (const block of blocks) {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) continue;

      // Split the block into lines to separate the grade level from the content.
      const lines = trimmedBlock.split(/\r?\n/);
      if (lines.length < 2) continue; // Malformed block, skip.

      const gradeLevel = lines[0].trim();
      const rawWorksheetContent = lines.slice(1).join('\n').trim();

      if (gradeLevel && rawWorksheetContent) {
        // To improve readability, replace any occurrence of 3 or more consecutive
        // newlines with just two. This preserves paragraph breaks while removing excessive spacing.
        const worksheetContent = rawWorksheetContent.replace(/\n{3,}/g, '\n\n');

        materials.push({
          gradeLevel,
          worksheetContent,
        });
      }
    }

    // If, after all that, we couldn't parse anything, it means the AI failed completely.
    // In this case, we return the raw output as a fallback for the user to see.
    if (materials.length === 0) {
      console.warn(
        'Could not parse any valid materials from AI output. Returning raw text.'
      );
      return { differentiatedMaterials: rawAiOutput };
    }

    // We successfully built the materials array. Now, we create the final JSON object.
    const finalJsonObject = {
      differentiatedMaterials: materials,
    };

    // Return the final, valid JSON string that the frontend expects.
    return { differentiatedMaterials: JSON.stringify(finalJsonObject, null, 2) };
  }
);

