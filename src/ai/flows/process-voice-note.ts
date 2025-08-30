
'use server';
/**
 * @fileOverview Transcribes and summarizes an audio voice note.
 *
 * - processVoiceNote - A function that handles the voice note processing.
 * - ProcessVoiceNoteInput - The input type for the processVoiceNote function.
 * - ProcessVoiceNoteOutput - The return type for the processVoiceNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessVoiceNoteInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ProcessVoiceNoteInput = z.infer<typeof ProcessVoiceNoteInputSchema>;

const ProcessVoiceNoteOutputSchema = z.object({
  transcription: z.string().describe('The full transcription of the audio.'),
  summary: z.string().describe('A concise one-sentence summary of the transcription.'),
});
export type ProcessVoiceNoteOutput = z.infer<typeof ProcessVoiceNoteOutputSchema>;

export async function processVoiceNote(input: ProcessVoiceNoteInput): Promise<ProcessVoiceNoteOutput> {
  return processVoiceNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processVoiceNotePrompt',
  input: {schema: ProcessVoiceNoteInputSchema},
  output: {schema: ProcessVoiceNoteOutputSchema},
  prompt: `You are an expert at processing audio notes for an inventory system.
Your task is to transcribe the provided audio and then provide a concise, one-sentence summary of the content.

Audio Note: {{media url=audioDataUri}}`,
});

const processVoiceNoteFlow = ai.defineFlow(
  {
    name: 'processVoiceNoteFlow',
    inputSchema: ProcessVoiceNoteInputSchema,
    outputSchema: ProcessVoiceNoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
