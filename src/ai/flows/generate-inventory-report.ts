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
  report: z.string().describe('A detailed report summarizing the inventory status, including seasonal trends and restocking recommendations.'),
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

You are provided with current inventory data. Analyze this data to generate a comprehensive report that includes:

- Overall inventory status summary.
- Identification of seasonal trends based on historical data and current stock levels.
- Recommendations for restocking items based on current stock and predicted demand.
- Suggestions for promotions to clear out excess stock.

Inventory Data: {{{inventoryData}}}

Generate the report in a clear and concise manner.
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
