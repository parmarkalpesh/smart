
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
  report: z.string().describe('A detailed report summarizing the inventory status, including seasonal trends and restocking recommendations, with a markdown table for trending products and waste reduction.'),
});
export type GenerateInventoryReportOutput = z.infer<typeof GenerateInventoryReportOutputSchema>;

export async function generateInventoryReport(input: GenerateInventoryReportInput): Promise<GenerateInventoryReportOutput> {
  return generateInventoryReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInventoryReportPrompt',
  input: {schema: GenerateInventoryReportInputSchema},
  output: {schema: GenerateInventoryReportOutputSchema},
  prompt: `You are an AI assistant specialized in inventory management, seasonal trend analysis, and waste reduction strategy.

You are provided with current inventory data. Analyze this data to generate a comprehensive report.

The report must include the following sections in markdown format:

**1. Overall Inventory Status:**
- A brief summary of the inventory health.

**2. Future Trending Products:**
- A markdown table with columns: "Product Name", "Current Quantity", "Predicted Trend", and "Recommendation".
- Analyze items based on their type, name, and the current date to predict future and seasonal trends.

**3. Waste Reduction Action Plan:**
- Identify items with an expiryDate that is approaching (e.g., within the next 30 days).
- For these items, create a markdown table with columns: "Product Name", "Expires On", "Quantity Left", and "Suggested Action".
- In the "Suggested Action" column, provide a creative and actionable promotional idea to sell the item before it expires (e.g., "Offer a 25% discount," "Bundle with 'Product Y'," "Create a 'Limited Time' flash sale"). Be specific.
- If no items are expiring soon, state that.

Inventory Data: {{{inventoryData}}}

Generate the full report in a clear, well-formatted markdown.
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
