
'use server';
/**
 * @fileOverview Updates an inventory item using a text command.
 *
 * - updateItemWithVoice - A function that handles the voice command processing.
 * - UpdateItemWithTextInput - The input type for the function.
 * - UpdateItemWithVoiceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ItemStatus } from '@/lib/types';

// The input schema for the flow
const UpdateItemWithTextInputSchema = z.object({
  command: z.string().describe('A text command from the user to update an inventory item.'),
  itemId: z.string().describe('The ID of the inventory item to update.'),
});
export type UpdateItemWithTextInput = z.infer<typeof UpdateItemWithTextInputSchema>;

// The output schema defines the possible fields that can be updated.
// It's a partial object, so only the fields mentioned in the voice command will be present.
const UpdateItemWithVoiceOutputSchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    quantity: z.coerce.number().optional(),
    status: z.enum(['Available', 'Checked Out', 'In Maintenance', 'Low Stock', 'Wasted']).optional(),
    location: z.string().optional(),
    supplier: z.string().optional(),
});
export type UpdateItemWithVoiceOutput = z.infer<typeof UpdateItemWithVoiceOutputSchema>;


// The main exported function that the client will call.
export async function updateItemWithVoice(input: UpdateItemWithTextInput): Promise<UpdateItemWithVoiceOutput> {
  return updateItemWithVoiceFlow(input);
}


// The tool that the AI will use to specify the updates.
const itemUpdateTool = ai.defineTool(
    {
        name: 'updateInventoryItem',
        description: 'Updates the fields of an inventory item based on the user\'s text command. Only specify the fields that the user explicitly mentioned to change.',
        inputSchema: UpdateItemWithVoiceOutputSchema,
        outputSchema: z.any(),
    },
    async (input) => {
        // In a real-world scenario, you might perform validation or other actions here.
        // For this implementation, the tool's purpose is to structure the data for the client.
        return input;
    }
)

const updatePrompt = ai.definePrompt(
    {
        name: 'updateItemWithTextPrompt',
        tools: [itemUpdateTool],
        input: { schema: UpdateItemWithTextInputSchema },
        prompt: `You are a voice assistant for an inventory management system.
A user has provided a text command to update an inventory item.
Analyze the text and determine which fields to update.
If the command is a clear instruction to update an item, use the 'updateInventoryItem' tool to specify the new values.
If the user's command is unclear, ambiguous, or does not seem to relate to updating an inventory item, respond with a clarifying question or a message indicating you can't process the request. Do not use the tool in this case.

Text command: {{{command}}}`,
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
    inputSchema: UpdateItemWithTextInputSchema,
    outputSchema: UpdateItemWithVoiceOutputSchema,
  },
  async (input) => {
    
    const llmResponse = await updatePrompt(input);
    const toolRequest = llmResponse.toolRequest;
    
    if (toolRequest?.name === 'updateInventoryItem' && toolRequest.input) {
        // The validated and structured data from the tool call is our output.
        // Zod parse will ensure the types are correct (e.g. quantity is a number)
        return UpdateItemWithVoiceOutputSchema.parse(toolRequest.input);
    }

    // If the tool wasn't called or the input was empty, it means the model
    // decided the command was unclear. Return an empty object to signal this to the client.
    return {};
  }
);
