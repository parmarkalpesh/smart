
'use server';
/**
 * @fileOverview Updates an inventory item using a text command.
 *
 * - updateItemWithText - A function that handles the text command processing.
 * - UpdateItemWithTextInput - The input type for the function.
 * - UpdateItemWithTextOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// The input schema for the flow
const UpdateItemWithTextInputSchema = z.object({
  command: z.string().describe('The text command from the user.'),
  itemId: z.string().describe('The ID of the inventory item to update.'),
});
export type UpdateItemWithTextInput = z.infer<typeof UpdateItemWithTextInputSchema>;

// The output schema defines the possible fields that can be updated.
// It's a partial object, so only the fields mentioned in the command will be present.
const UpdateItemWithTextOutputSchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    quantity: z.coerce.number().optional(),
    status: z.enum(['Available', 'Checked Out', 'In Maintenance', 'Low Stock', 'Wasted']).optional(),
    location: z.string().optional(),
    supplier: z.string().optional(),
});
export type UpdateItemWithTextOutput = z.infer<typeof UpdateItemWithTextOutputSchema>;


// The main exported function that the client will call.
export async function updateItemWithText(input: UpdateItemWithTextInput): Promise<UpdateItemWithTextOutput> {
  return updateItemWithTextFlow(input);
}


// The tool that the AI will use to specify the updates.
const itemUpdateTool = ai.defineTool(
    {
        name: 'updateInventoryItem',
        description: 'Updates the fields of an inventory item based on the user\'s command. Only specify the fields that the user explicitly mentioned to change.',
        inputSchema: UpdateItemWithTextOutputSchema,
        outputSchema: z.any(),
    },
    async (input) => {
        // This function is just a schema for the LLM.
        // The actual update happens on the client based on the tool's input.
        return input;
    }
)

const updatePrompt = ai.definePrompt(
    {
        name: 'updateItemWithTextPrompt',
        tools: [itemUpdateTool],
        input: { schema: z.object({ command: z.string() }) },
        prompt: `You are an assistant for an inventory management system.
A user has provided a command to update an inventory item.
Analyze the text and determine which fields to update.
Use the 'updateInventoryItem' tool to specify the new values. Do not make up values or fields.
If the user's command is unclear, ambiguous, or does not seem to relate to updating an inventory item, respond with a clarifying question or a message indicating you can't process the request. Do not use the tool in this case.

Command: {{{command}}}`,
        config: {
            temperature: 0, // Lower temperature for more deterministic, structured output
        }
    }
);


// The main Genkit flow.
const updateItemWithTextFlow = ai.defineFlow(
  {
    name: 'updateItemWithTextFlow',
    inputSchema: UpdateItemWithTextInputSchema,
    outputSchema: UpdateItemWithTextOutputSchema,
  },
  async (input) => {
    
    // Call the update prompt with the command
    const llmResponse = await updatePrompt({ command: input.command });
    const toolRequest = llmResponse.toolRequest;
    
    if (toolRequest?.name === 'updateInventoryItem' && toolRequest.input) {
        // The validated and structured data from the tool call is our output.
        return UpdateItemWithTextOutputSchema.parse(toolRequest.input);
    }

    // If the tool wasn't called, it means the model decided the command was unclear.
    // Return an empty object to signify no update should happen.
    return {};
  }
);
