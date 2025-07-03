// src/ai/flows/create-differentiated-materials.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating differentiated worksheets from a textbook page image.
 *
 * - createDifferentiatedMaterials - A function that takes a textbook page image and generates differentiated worksheets for different grade levels.
 * - CreateDifferentiatedMaterialsInput - The input type for the createDifferentiatedMaterials function.
 * - CreateDifferentiatedMaterialsOutput - The return type for the createDifferentiatedMaterials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  worksheets: z.array(
    z.object({
      gradeLevel: z.string().describe('The grade level of the worksheet.'),
      worksheetContent: z.string().describe('The content of the worksheet.'),
    })
  ),
});
export type CreateDifferentiatedMaterialsOutput = z.infer<typeof CreateDifferentiatedMaterialsOutputSchema>;

export async function createDifferentiatedMaterials(input: CreateDifferentiatedMaterialsInput): Promise<CreateDifferentiatedMaterialsOutput> {
  return createDifferentiatedMaterialsFlow(input);
}

const createDifferentiatedMaterialsPrompt = ai.definePrompt({
  name: 'createDifferentiatedMaterialsPrompt',
  input: {schema: CreateDifferentiatedMaterialsInputSchema},
  output: {schema: CreateDifferentiatedMaterialsOutputSchema},
  prompt: `You are an expert teacher specializing in creating differentiated worksheets for multi-grade classrooms.

You will receive an image of a textbook page and a list of grade levels. Your task is to generate a worksheet tailored to each grade level.

Textbook Page: {{media url=textbookPageImage}}
Grade Levels: {{{gradeLevels}}}
Language: {{{language}}}

For each grade level, create a worksheet that is appropriate for their understanding level based on the textbook page. The content should be in {{{language}}}.

Output a JSON object with an array of worksheets. Each worksheet should have the gradeLevel and worksheetContent.

Example:
{
  "worksheets": [
    {
      "gradeLevel": "1",
      "worksheetContent": "Write a story about the picture"
    },
    {
      "gradeLevel": "2",
      "worksheetContent": "Answer the following questions"
    }
  ]
}
`,
});

const createDifferentiatedMaterialsFlow = ai.defineFlow(
  {
    name: 'createDifferentiatedMaterialsFlow',
    inputSchema: CreateDifferentiatedMaterialsInputSchema,
    outputSchema: CreateDifferentiatedMaterialsOutputSchema,
  },
  async input => {
    const {output} = await createDifferentiatedMaterialsPrompt(input);
    return output!;
  }
);

