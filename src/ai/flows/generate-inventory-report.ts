
// src/ai/flows/generate-inventory-report.ts
'use server';
/**
 * @fileOverview Generates a report summarizing current inventory, forecasting future demand, and providing stocking recommendations.
 *
 * - generateInventoryReport - A function that generates the inventory report.
 * - GenerateInventoryReportInput - The input type for the generateInventoryReport function.
 * - GenerateInventoryReportOutput - The return type for the generateInventoryReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInventoryReportInputSchema = z.object({
  inventoryData: z.string().describe('JSON string of the current inventory data. Array of objects with fields like name, type, date, status, quantity, location, etc.'),
});
export type GenerateInventoryReportInput = z.infer<typeof GenerateInventoryReportInputSchema>;

const GenerateInventoryReportOutputSchema = z.object({
  report: z.string().describe('A detailed report with demand forecasting, optimal stock level suggestions, and a markdown table for trending products and waste reduction.'),
});
export type GenerateInventoryReportOutput = z.infer<typeof GenerateInventoryReportOutputSchema>;

export async function generateInventoryReport(input: GenerateInventoryReportInput): Promise<GenerateInventoryReportOutput> {
  return generateInventoryReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInventoryReportPrompt',
  input: {schema: GenerateInventoryReportInputSchema},
  output: {schema: GenerateInventoryReportOutputSchema},
  prompt: `You are an expert AI in predictive analytics and inventory management.

You are provided with current inventory data. Your task is to analyze this data to generate a comprehensive "Predictive Inventory Analysis" report.

The report must be in markdown format and include the following sections:

**1. Demand Forecast & Stock-out Alerts:**
- Analyze the provided inventory data to forecast future product demand, considering item types, seasonality, and location.
- Identify and alert about any items at risk of stocking out soon based on their current quantity and predicted demand.
- Provide a brief summary of your findings. For example, you might suggest consolidating stock by redistributing items from a location with a surplus to one with a deficit.

**2. Optimal Stock Level Recommendations:**
- Based on your forecast, create a markdown table with the columns: "Product Name", "Location", "Current Quantity", "Predicted Trend", and "Recommendation".
- In the "Recommendation" column, suggest optimal stock levels and specific restocking actions (e.g., "Increase stock to 50 units," "Maintain current level," "Reorder 20 units before next month").

**3. Upcoming Maintenance Schedule:**
- Identify any equipment with a 'nextMaintenanceDate' that is approaching (e.g., within the next 30 days).
- Create a markdown table with columns: "Equipment Name", "Location", "Maintenance Due Date", and "Suggested Action".
- In the "Suggested Action" column, recommend actions like "Schedule service with vendor" or "Perform internal check-up".
- If no maintenance is due soon, state that.

**4. Waste Reduction Action Plan:**
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
