
'use server';
/**
 * @fileOverview Updates an inventory item using a voice command.
 *
 * - updateItemWithVoice - A function that handles the voice command processing.
 * - UpdateItemWithVoiceInput - The input type for the function.
 * - UpdateItemWithVoiceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// The input schema for the flow
const UpdateItemWithVoiceInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio recording of the user's command, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  itemId: z.string().describe('The ID of the inventory item to update.'),
});
export type UpdateItemWithVoiceInput = z.infer<typeof UpdateItemWithVoiceInputSchema>;

// The output schema defines the possible fields that can be updated.
// It's a partial object, so only the fields mentioned in the voice command will be present.
const UpdateItemWithVoiceOutputSchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    quantity: z.coerce.number().optional(),
    status: z.enum(['Available', 'Checked Out', 'In Maintenance', 'Low Stock', 'Wasted']).optional(),
    location: z.string().optional(),
    supplier: z.string().optional(),
    transcription: z.string().describe('The transcription of the audio command.'),
});
export type UpdateItemWithVoiceOutput = z.infer<typeof UpdateItemWithVoiceOutputSchema>;


// The main exported function that the client will call.
export async function updateItemWithVoice(input: UpdateItemWithVoiceInput): Promise<UpdateItemWithVoiceOutput> {
  return updateItemWithVoiceFlow(input);
}


// The tool that the AI will use to specify the updates.
const itemUpdateTool = ai.defineTool(
    {
        name: 'updateInventoryItem',
        description: 'Updates the fields of an inventory item based on the user\'s transcribed command. Only specify the fields that the user explicitly mentioned to change.',
        inputSchema: UpdateItemWithVoiceOutputSchema.omit({ transcription: true }), // The tool doesn't need to return the transcription
        outputSchema: z.any(),
    },
    async (input) => {
        // This function is just a schema for the LLM. 
        // The actual update happens in the client based on the tool's input.
        return input;
    }
)

const updatePrompt = ai.definePrompt(
    {
        name: 'updateItemWithVoicePrompt',
        tools: [itemUpdateTool],
        input: { schema: z.object({ transcription: z.string() }) },
        prompt: `You are a voice assistant for an inventory management system.
A user has provided a transcribed command to update an inventory item.
Analyze the text and determine which fields to update.
Use the 'updateInventoryItem' tool to specify the new values. Do not make up values or fields.
If the user's command is unclear, ambiguous, or does not seem to relate to updating an inventory item, respond with a clarifying question or a message indicating you can't process the request. Do not use the tool in this case.

Transcribed command: {{{transcription}}}`,
        config: {
            // Lower temperature for more deterministic, structured output
            temperature: 0.1,
        }
    }
);


// The main Genkit flow.
const updateItemWithVoiceFlow = ai.defineFlow(
  {
    name: 'updateItemWithVoiceFlow',
    inputSchema: UpdateItemWithVoiceInputSchema,
    outputSchema: UpdateItemWithVoiceOutputSchema,
  },
  async (input) => {
    
    // Step 1: Transcribe the audio
    const { text: transcription } = await ai.generate({
      prompt: `Transcribe the following audio note for an inventory system: {{media url="${input.audioDataUri}"}}`,
    });

    if (!transcription) {
        throw new Error('Failed to transcribe audio.');
    }

    // Step 2: Call the update prompt with the transcription
    const llmResponse = await updatePrompt({ transcription });
    const toolRequest = llmResponse.toolRequest;
    
    if (toolRequest?.name === 'updateInventoryItem' && toolRequest.input) {
        const updates = UpdateItemWithVoiceOutputSchema.omit({ transcription: true }).parse(toolRequest.input);
        return {
            ...updates,
            transcription, // Return the transcription along with the updates
        };
    }

    // If the tool wasn't called, it means the model decided the command was unclear.
    // Return only the transcription so the user can see what the AI heard.
    return { transcription };
  }
);
