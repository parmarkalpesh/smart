
'use server';
/**
 * @fileOverview Generates purchase order proposals for items below their reorder threshold.
 *
 * - generatePurchaseOrders - A function that generates the purchase orders.
 * - GeneratePurchaseOrdersInput - The input type for the function.
 * - GeneratePurchaseOrdersOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePurchaseOrdersInputSchema = z.object({
  inventoryData: z.string().describe('JSON string of the current inventory data. Array of objects with fields like name, quantity, reorderThreshold, reorderQuantity, supplier, etc.'),
});
export type GeneratePurchaseOrdersInput = z.infer<typeof GeneratePurchaseOrdersInputSchema>;

const GeneratePurchaseOrdersOutputSchema = z.object({
  report: z.string().describe('A detailed report in markdown format containing purchase order proposals for each supplier.'),
});
export type GeneratePurchaseOrdersOutput = z.infer<typeof GeneratePurchaseOrdersOutputSchema>;

export async function generatePurchaseOrders(input: GeneratePurchaseOrdersInput): Promise<GeneratePurchaseOrdersOutput> {
  return generatePurchaseOrdersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePurchaseOrdersPrompt',
  input: {schema: GeneratePurchaseOrdersInputSchema},
  output: {schema: GeneratePurchaseOrdersOutputSchema},
  prompt: `You are an expert AI in supply chain management and purchasing.

You are provided with the current inventory data. Your task is to identify items that need to be reordered and generate purchase order proposals for each supplier.

An item needs to be reordered if its 'quantity' is less than or equal to its 'reorderThreshold'. The quantity to order is defined by 'reorderQuantity', defaulting to 50 if not specified.

**Instructions:**

1.  **Analyze the inventory:** Iterate through the provided inventory data and identify all items that need to be reordered.
2.  **Group by Supplier:** Group the items that need to be reordered by their 'supplier'. If a supplier is not listed, group it under "Unknown Supplier".
3.  **Generate Purchase Orders:** For each supplier, create a separate purchase order proposal in markdown format. Each proposal should include:
    *   A clear heading with the supplier's name (e.g., "### Purchase Order for TechSupplier Inc.").
    *   The current date.
    *   A markdown table with the columns: "Item Name", "Current Quantity", and "Reorder Quantity".
    *   A concluding line with a placeholder for a signature.
4.  **Combine Proposals:** Combine all generated purchase order proposals into a single markdown string. Separate each section with a horizontal rule (\`---\`).
5.  **Handle No Reorders:** If no items need reordering, the report should clearly state: "All inventory levels are sufficient. No purchase orders are needed at this time."

Inventory Data: {{{inventoryData}}}

Generate the full report based on these instructions.
`,
});

const generatePurchaseOrdersFlow = ai.defineFlow(
  {
    name: 'generatePurchaseOrdersFlow',
    inputSchema: GeneratePurchaseOrdersInputSchema,
    outputSchema: GeneratePurchaseOrdersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
