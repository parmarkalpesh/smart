
'use server';
/**
 * @fileOverview A conversational AI flow for investigating inventory data.
 *
 * This file defines a Genkit flow that allows users to have a conversation
 * about their inventory. The AI can answer questions, provide summaries,
* and use tools to access real-time inventory data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Message } from 'genkit/experimental/ai';
import type { InvestigateInventoryInput, History } from '@/lib/types';


// Define the input schema for the getInventoryData tool.
// This allows the AI to filter data by name or type.
const GetInventoryInputSchema = z.object({
  filter: z.object({
    name: z.string().optional().describe('Filter by the name of the item (can be a partial match).'),
    type: z.string().optional().describe('Filter by the type of the item (e.g., "Electronics", "Furniture").'),
  }).optional().describe('The filter to apply when fetching inventory data. If no filter is provided, all items are returned.'),
});

/**
 * The main function that clients will call to interact with the AI investigator.
 * @param input The user's query and the current inventory data.
 * @returns A text response from the AI.
 */
export async function investigateInventory(input: InvestigateInventoryInput): Promise<string> {
  return investigateInventoryFlow(input);
}


/**
 * A Genkit Tool that allows the AI to fetch and filter inventory data.
 * The AI will decide when to use this tool based on the user's query.
 */
const getInventoryData = ai.defineTool(
  {
    name: 'getInventoryData',
    description: 'Retrieves a list of inventory items. Can be filtered by name or type.',
    inputSchema: GetInventoryInputSchema,
    outputSchema: z.any(), // We'll let the AI handle the raw JSON.
  },
  async (input) => {
    // Note: The `input` here is provided by the AI model's tool call.
    // This function body is where you would typically fetch from a database.
    // For this implementation, the full data is passed in the main flow's input,
    // and this tool's logic is handled inside the prompt's context.
    // This function body itself is not executed in this specific setup, but is required by Genkit.
    return { success: true }; 
  }
);


/**
 * The Genkit Prompt that defines the AI's persona, instructions, and tools.
 */
const investigatorPrompt = ai.definePrompt({
    name: 'investigatorPrompt',
    // The model will decide when to call the `getInventoryData` tool.
    tools: [getInventoryData],
    system: `You are an expert inventory analyst and investigator.
Your goal is to help the user understand their inventory data by answering their questions.
You are friendly, helpful, and concise.
You have access to a tool called 'getInventoryData' that can retrieve inventory items.
Use this tool whenever the user asks a question that requires information about the inventory.

IMPORTANT: The user has provided the full inventory data. When you use the 'getInventoryData' tool, you do not need to call an external API. Instead, you should filter the provided 'inventoryData' JSON based on the parameters of the tool call. After filtering, use the resulting data to answer the user's question.

For example, if the user asks "how many laptops do I have?", you should:
1. Decide to call the 'getInventoryData' tool with a filter like { name: 'laptop' }.
2. Internally, filter the 'inventoryData' JSON to find items matching 'laptop'.
3. Use the filtered list to formulate your answer, e.g., "You have 10 Laptop Pro units available."

Always format your answers clearly. Use markdown tables, lists, and bold text to improve readability.
If the user's query is ambiguous, ask for clarification.
If the query is outside the scope of inventory management, politely decline to answer.
`,
});


/**
 * The main Genkit Flow for handling the inventory investigation conversation.
 */
const investigateInventoryFlow = ai.defineFlow(
  {
    name: 'investigateInventoryFlow',
    inputSchema: z.object({
      query: z.string().describe('The user\'s question or command.'),
      inventoryData: z.string().describe('The full inventory data as a JSON string. This will be used by the tool.'),
      history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })).optional().describe('The conversation history.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const { query, inventoryData, history } = input;
    
    const fullHistory: Message[] = (history || []).map(msg => ({
      role: msg.role as 'user' | 'model',
      content: msg.content,
    }));

    // Generate the AI's response.
    const llmResponse = await investigatorPrompt({
        history: fullHistory,
        messages: [
            {
                role: 'user',
                content: query
            }
        ],
        tools: [getInventoryData],
        toolContext: {
          // Provide the full inventory data to the tool's context
          getInventoryData: JSON.parse(inventoryData)
        }
    });

    // Return the generated text content.
    return llmResponse.text;
  }
);
