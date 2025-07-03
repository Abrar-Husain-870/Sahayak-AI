// src/ai/flows/design-visual-aids.ts
'use server';
/**
 * @fileOverview Visual aid generator flow.
 *
 * - designVisualAid - A function that generates simple line drawings or charts based on a teacher's description.
 * - DesignVisualAidInput - The input type for the designVisualAid function.
 * - DesignVisualAidOutput - The return type for the designVisualAid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const DesignVisualAidInputSchema = z.object({
  description: z.string().describe('The description of the visual aid to generate.'),
});

export type DesignVisualAidInput = z.infer<typeof DesignVisualAidInputSchema>;

const DesignVisualAidOutputSchema = z.object({
  media: z.string().describe('A data URI containing the generated image.'),
});

export type DesignVisualAidOutput = z.infer<typeof DesignVisualAidOutputSchema>;

export async function designVisualAid(input: DesignVisualAidInput): Promise<DesignVisualAidOutput> {
  return designVisualAidFlow(input);
}

const designVisualAidFlow = ai.defineFlow(
  {
    name: 'designVisualAidFlow',
    inputSchema: DesignVisualAidInputSchema,
    outputSchema: DesignVisualAidOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.description,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No media returned');
    }

    return {media: media.url};
  }
);
