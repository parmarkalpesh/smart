
'use server';
/**
 * @fileOverview Updates an inventory item using a text command.
 *
 * This file defines a Genkit flow that uses an AI model with tool-calling
 * to parse a natural language command and determine which fields of an inventory
 * item to update.
 *
 * - updateItemWithText - The main exported function that takes a text command and an item ID.
 * - UpdateItemWithTextInput - The Zod schema for the input of the flow.
 * - UpdateItemWithTextOutput - The Zod schema for the structured output of the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. Define the input schema for the AI flow.
// This specifies the data required to run the flow: a text command and the ID of the item to update.
const UpdateItemWithTextInputSchema = z.object({
  command: z.string().describe('The natural language text command from the user.'),
  itemId: z.string().describe('The ID of the inventory item to update.'),
});
export type UpdateItemWithTextInput = z.infer<typeof UpdateItemWithTextInputSchema>;

// 2. Define the output schema for the AI flow.
// This defines all the possible fields that can be updated on an inventory item.
// The fields are optional because a command might only update one or two of them.
// The AI will populate only the fields it infers from the command.
const UpdateItemWithTextOutputSchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    quantity: z.coerce.number().optional(), // `coerce` attempts to convert the value to a number
    status: z.enum(['Available', 'Checked Out', 'In Maintenance', 'Low Stock', 'Wasted']).optional(),
    location: z.string().optional(),
    supplier: z.string().optional(),
    // Note: Date fields could be added here as well, but require more complex string parsing logic.
});
export type UpdateItemWithTextOutput = z.infer<typeof UpdateItemWithTextOutputSchema>;

// 3. Define an AI "tool" that the model can use.
// A tool is like a function that the AI can decide to call. By defining this tool,
// we are telling the AI how to structure its output. The AI will not actually *run* this
// function's code, but it will provide the `input` for it, which is exactly what we need.
const itemUpdateTool = ai.defineTool(
    {
        name: 'updateInventoryItem',
        description: 'Updates the fields of an inventory item based on the user\'s command. Only specify the fields that the user explicitly mentioned to change.',
        inputSchema: UpdateItemWithTextOutputSchema, // The tool's input is our desired output structure.
        outputSchema: z.any(), // The output of the tool itself doesn't matter for this use case.
    },
    async (input) => {
        // This function is just a placeholder. The AI uses the *schema* of this tool
        // to structure its response. The actual inventory update happens on the
        // client-side using the data that the AI provides as the 'input' to this tool.
        return { success: true };
    }
)

// 4. Define the main AI prompt.
// This prompt instructs the AI on its role and how to behave.
// Crucially, it tells the AI to use the `updateInventoryItem` tool.
const updatePrompt = ai.definePrompt(
    {
        name: 'updateItemWithTextPrompt',
        tools: [itemUpdateTool], // Make the tool available to the AI.
        input: { schema: z.object({ command: z.string() }) },
        prompt: `You are an assistant for an inventory management system.
A user has provided a command to update an inventory item.
Analyze the text and determine which fields to update with their new values.
Use the 'updateInventoryItem' tool to specify the new values. Do not make up values or fields.

For example, if the user says "change the quantity to 25 and set the status to low stock", you must call the tool with: { quantity: 25, status: 'Low Stock' }.
If the user's command is unclear, ambiguous, or does not seem to relate to updating an inventory item, respond with a clarifying question or a message indicating you can't process the request. Do not use the tool in this case.

Command: {{{command}}}`,
        config: {
            temperature: 0, // Lower temperature makes the AI more deterministic and better at following structured instructions.
        }
    }
);


// 5. Define the Genkit Flow.
// A flow orchestrates the call to the AI model.
const updateItemWithTextFlow = ai.defineFlow(
  {
    name: 'updateItemWithTextFlow',
    inputSchema: UpdateItemWithTextInputSchema,
    outputSchema: UpdateItemWithTextOutputSchema,
  },
  async (input) => {

    // Call the AI prompt with the user's command.
    const llmResponse = await updatePrompt({ command: input.command });

    // Check if the AI decided to call our tool.
    const toolRequest = llmResponse.toolRequest;
    if (toolRequest?.name === 'updateInventoryItem' && toolRequest.input) {
        // If the tool was called, its input is our structured data.
        // We parse it with our Zod schema to ensure it's valid.
        return UpdateItemWithTextOutputSchema.parse(toolRequest.input);
    }

    // If the tool was not called, it means the AI judged the command to be unclear.
    // We return an empty object to signify that no update should happen.
    // The UI can then use this to inform the user.
    return {};
  }
);


/**
 * The main exported server action that the client-side code will call.
 * It simply calls the Genkit flow and returns its result.
 * @param input The user's command and the item ID.
 * @returns A promise that resolves to a partial inventory item object with the fields to update.
 */
export async function updateItemWithText(input: UpdateItemWithTextInput): Promise<UpdateItemWithTextOutput> {
  return updateItemWithTextFlow(input);
}
