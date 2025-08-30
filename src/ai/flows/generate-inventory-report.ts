
// src/ai/flows/generate-inventory-report.ts
'use server';
/**
 * @fileOverview Generates a report summarizing the current inventory status and seasonal trends.
 *
 * - generateInventoryReport - A function that generates the inventory report.
 * - GenerateInventoryReportInput - The input type for the generateInventoryReport function.
 * - GenerateInventoryReportOutput - The return type for the generateInventoryReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInventoryReportInputSchema = z.object({
  inventoryData: z.string().describe('JSON string of the current inventory data. Array of objects with fields like name, type, date, status, quantity, etc.'),
});
export type GenerateInventoryReportInput = z.infer<typeof GenerateInventoryReportInputSchema>;

const GenerateInventoryReportOutputSchema = z.object({
  report: z.string().describe('A detailed report summarizing the inventory status, including seasonal trends and restocking recommendations, with a markdown table for trending products.'),
});
export type GenerateInventoryReportOutput = z.infer<typeof GenerateInventoryReportOutputSchema>;

export async function generateInventoryReport(input: GenerateInventoryReportInput): Promise<GenerateInventoryReportOutput> {
  return generateInventoryReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInventoryReportPrompt',
  input: {schema: GenerateInventoryReportInputSchema},
  output: {schema: GenerateInventoryReportOutputSchema},
  prompt: `You are an AI assistant specialized in inventory management and seasonal trend analysis.

You are provided with current inventory data. Analyze this data to generate a comprehensive report.

The report should include:
- A brief overall inventory status summary.
- A section for "Future Trending Products".

For the "Future Trending Products" section, create a markdown table with the following columns:
- "Product Name": The name of the item.
- "Current Quantity": The current stock level.
- "Predicted Trend": A brief explanation of why the product is expected to trend (e.g., "High demand in Summer", "Upcoming holiday season").
- "Recommendation": Actionable advice (e.g., "Restock immediately", "Monitor stock", "Plan promotion").

Analyze the items based on their type, name, and the current date to predict future and seasonal trends.

Inventory Data: {{{inventoryData}}}

Generate the full report in a clear and well-formatted markdown.
`,
});

const generateInventoryReportFlow = ai.defineFlow(
  {
    name: 'generateInventoryReportFlow',
    inputSchema: GenerateInventoryReportInputSchema,
    outputSchema: GenerateInventoryReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
