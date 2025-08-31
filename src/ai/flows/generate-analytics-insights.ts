
'use server';
/**
 * @fileOverview Generates inventory analytics insights using AI.
 *
 * - generateAnalyticsInsights - A function that analyzes inventory data.
 * - GenerateAnalyticsInsightsInput - The input type for the function.
 * - GenerateAnalyticsInsightsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnalyticsInsightsInputSchema = z.object({
  inventoryData: z.string().describe('JSON string of the current inventory data. Array of objects with fields like name, quantity, reorderThreshold, dateAdded, weight, etc.'),
});
export type GenerateAnalyticsInsightsInput = z.infer<typeof GenerateAnalyticsInsightsInputSchema>;

const InsightItemSchema = z.object({
    name: z.string().describe('The name of the inventory item.'),
    quantity: z.number().describe('The current quantity of the item.'),
    insight: z.string().describe('A brief insight about this item.'),
});

const GenerateAnalyticsInsightsOutputSchema = z.object({
  forecastedStockouts: z.array(InsightItemSchema).describe('List of items that are forecasted to stock out soon.'),
  reorderTrends: z.string().describe('A summary of reordering trends based on current stock levels and reorder thresholds.'),
  topSellingItems: z.array(InsightItemSchema).describe('List of items identified as top-selling or fast-moving.'),
  slowMovingStock: z.array(InsightItemSchema).describe('List of items identified as slow-moving.'),
  seasonalTrends: z.string().describe('Analysis of potential seasonal trends or other time-based patterns.'),
  iotShelfInsights: z.string().describe('A summary of insights derived from simulated IoT shelf weight data, if available.'),
});
export type GenerateAnalyticsInsightsOutput = z.infer<typeof GenerateAnalyticsInsightsOutputSchema>;

export async function generateAnalyticsInsights(input: GenerateAnalyticsInsightsInput): Promise<GenerateAnalyticsInsightsOutput> {
  return generateAnalyticsInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnalyticsInsightsPrompt',
  input: {schema: GenerateAnalyticsInsightsInputSchema},
  output: {schema: GenerateAnalyticsInsightsOutputSchema},
  prompt: `You are an expert AI in supply chain management and data analytics with IoT integration.

You are provided with the current inventory data. Your task is to analyze this data and generate a report with predictive KPIs and insights.

**Instructions:**

1.  **Analyze the inventory data:** {{{inventoryData}}}
2.  **Forecast Stockouts:** Identify items that are at high risk of stocking out soon. Consider items with low quantity, especially those below their reorder threshold. For each, provide a brief insight.
3.  **Analyze Reorder Trends:** Based on the number of items below their reorder threshold, provide a summary of the overall reorder situation.
4.  **Identify Top-Selling / Fast-Moving Items:** Based on check-out velocity (which you'll have to infer from status changes or assume based on low stock levels for this exercise), identify the top 3-5 fastest-moving items. Provide a brief insight for each. For this task, assume items with "Low Stock" or low quantity are fast-moving.
5.  **Identify Slow-Moving Stock:** Identify the top 3-5 slowest-moving items. Assume items with high quantity and 'Available' status that haven't been updated recently are slow-moving. Provide a brief insight for each.
6.  **Analyze Seasonal Trends:** Provide a paragraph on potential seasonal trends. Since you don't have historical data, make educated guesses based on item types (e.g., "Office supplies might see a dip during holiday seasons").
7.  **Analyze IoT Shelf Data**: The data may contain 'shelfId' and 'weight' for items. If this data is present, provide a summary of any interesting findings. For example, "Shelf SH-01 seems to hold high-turnover items like electronics and accessories." or "Weight data seems consistent with reported quantities." If no IoT data is present, state that.

Generate a full JSON output based on these instructions. Be insightful and concise.
`,
});

const generateAnalyticsInsightsFlow = ai.defineFlow(
  {
    name: 'generateAnalyticsInsightsFlow',
    inputSchema: GenerateAnalyticsInsightsInputSchema,
    outputSchema: GenerateAnalyticsInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
