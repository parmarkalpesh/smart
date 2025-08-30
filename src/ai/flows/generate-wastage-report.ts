
'use server';
/**
 * @fileOverview Generates a report analyzing wasted inventory to provide purchasing recommendations.
 *
 * - generateWastageReport - A function that generates the wastage report.
 * - GenerateWastageReportInput - The input type for the generateWastageReport function.
 * - GenerateWastageReportOutput - The return type for the generateWastageReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWastageReportInputSchema = z.object({
  inventoryData: z.string().describe('JSON string of the current inventory data, including items with a "Wasted" status.'),
});
export type GenerateWastageReportInput = z.infer<typeof GenerateWastageReportInputSchema>;

const GenerateWastageReportOutputSchema = z.object({
  report: z.string().describe('A detailed report analyzing wasted products and providing actionable recommendations to adjust purchasing strategy, formatted in markdown.'),
});
export type GenerateWastageReportOutput = z.infer<typeof GenerateWastageReportOutputSchema>;

export async function generateWastageReport(input: GenerateWastageReportInput): Promise<GenerateWastageReportOutput> {
  return generateWastageReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWastageReportPrompt',
  input: {schema: GenerateWastageReportInputSchema},
  output: {schema: GenerateWastageReportOutputSchema},
  prompt: `You are an AI expert in inventory management and supply chain optimization.

You are provided with inventory data that includes items marked with a "Wasted" status. Your task is to analyze this data to generate a comprehensive Wastage Analysis Report.

The report must be in markdown format and include the following sections:

**1. Top Wasted Products:**
- Identify the products that are most frequently marked as "Wasted".
- Create a markdown table with columns: "Product Name", "Type", and "Total Wasted Quantity".
- List the top 3-5 most wasted products. If there are no wasted products, state that clearly.

**2. Wastage Root Cause Analysis:**
- For the top wasted products, analyze the potential reasons for the wastage. Consider factors like overstocking, low demand, or short shelf-life (if expiry dates are available).
- Provide a brief, insightful analysis for each product.

**3. Purchasing Recommendations:**
- Based on your analysis, provide specific, actionable recommendations to adjust the purchasing strategy for the identified products.
- For example: "Reduce the next order of 'Product X' by 20%," "Consider ordering 'Product Y' more frequently in smaller batches," or "Discontinue stocking 'Product Z' if wastage continues."

**4. Overall Summary:**
- A concluding paragraph summarizing the key findings and the potential cost savings or efficiency gains from implementing the recommendations.

Analyze the following inventory data:
{{{inventoryData}}}

Generate the full report in a clear, well-formatted markdown. If no items are marked as 'Wasted', generate a report stating that there is no wastage data to analyze.
`,
});

const generateWastageReportFlow = ai.defineFlow(
  {
    name: 'generateWastageReportFlow',
    inputSchema: GenerateWastageReportInputSchema,
    outputSchema: GenerateWastageReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
