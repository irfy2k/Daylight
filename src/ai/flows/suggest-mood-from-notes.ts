'use server';
/**
 * @fileOverview Suggests a mood based on the text entered in daily notes.
 *
 * - suggestMoodFromNotes - A function that suggests a mood from notes.
 * - SuggestMoodFromNotesInput - The input type for the suggestMoodFromNotes function.
 * - SuggestMoodFromNotesOutput - The return type for the suggestMoodFromNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMoodFromNotesInputSchema = z.object({
  notes: z.string().describe('The text from the daily notes.'),
});
export type SuggestMoodFromNotesInput = z.infer<typeof SuggestMoodFromNotesInputSchema>;

const SuggestMoodFromNotesOutputSchema = z.object({
  suggestedMood: z
    .enum(['happy', 'sad', 'neutral', 'excited', 'anxious', 'frustrated'])
    .describe('The suggested mood based on the notes.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence level of the suggested mood (0 to 1).'),
});
export type SuggestMoodFromNotesOutput = z.infer<typeof SuggestMoodFromNotesOutputSchema>;

export async function suggestMoodFromNotes(input: SuggestMoodFromNotesInput): Promise<SuggestMoodFromNotesOutput> {
  return suggestMoodFromNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMoodFromNotesPrompt',
  input: {schema: SuggestMoodFromNotesInputSchema},
  output: {schema: SuggestMoodFromNotesOutputSchema},
  prompt: `Based on the following text from daily notes, suggest a mood and a confidence level (0 to 1) for the suggested mood.\n\nNotes: {{{notes}}}`,
});

const suggestMoodFromNotesFlow = ai.defineFlow(
  {
    name: 'suggestMoodFromNotesFlow',
    inputSchema: SuggestMoodFromNotesInputSchema,
    outputSchema: SuggestMoodFromNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
