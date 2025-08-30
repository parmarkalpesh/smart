
'use server';
/**
 * @fileOverview Transcribes an audio file to text using an AI model.
 *
 * This file defines a simple Genkit flow that takes audio data as input
 * and returns the transcribed text.
 *
 * - transcribeAudio - The main exported function that handles the audio transcription.
 * - TranscribeAudioInput - The Zod schema for the input (the audio data URI).
 * - TranscribeAudioOutput - The Zod schema for the output (the transcribed text).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. Define the input schema for the flow.
// It expects a single string containing the audio data encoded as a Base64 data URI.
const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;


// 2. Define the output schema for the flow.
// It will return an object with a single `transcription` field.
const TranscribeAudioOutputSchema = z.object({
    transcription: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;


/**
 * The main exported server action that the client-side code will call.
 * @param input An object containing the audio data URI.
 * @returns A promise that resolves to an object with the transcription.
 */
export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

// 3. Define the Genkit Flow.
// This flow orchestrates the call to the AI model for transcription.
const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {

    // Use `ai.generate()` to call the model.
    // The prompt includes a special syntax `{{media url="..."}}` which tells
    // Genkit to handle the data URI as media input for the model.
    const { text: transcription } = await ai.generate({
      prompt: `Transcribe the following audio: {{media url="${input.audioDataUri}"}}`,
    });

    if (!transcription) {
        throw new Error('Failed to transcribe audio. The model returned no text.');
    }

    // Return the transcription in the structure defined by our output schema.
    return { transcription };
  }
);
