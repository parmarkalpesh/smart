
'use server';
/**
 * @fileOverview Generates purchase order proposals for items below their reorder threshold or that are in high demand.
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
  report: z.string().describe('A detailed report in markdown format containing purchase order proposals for each supplier, including alerts for delays and suggestions for alternative suppliers.'),
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

You are provided with the current inventory data. Your task is to identify items that need to be reordered, check for delivery delays, and generate purchase order proposals for each supplier, including suggestions for alternatives.

An item needs to be reordered if its 'quantity' is less than or equal to its 'reorderThreshold' or if it's in high demand. The quantity to order is defined by 'reorderQuantity', defaulting to 50 if not specified.

**Instructions:**

1.  **Analyze the inventory:** Iterate through the provided inventory data and identify all items that need to be reordered. This includes:
    * Items where 'quantity' is less than or equal to 'reorderThreshold'.
    * Items that appear to be in high demand (e.g., status is 'Low Stock').
2.  **Check for Delays:** Identify any items with a 'deliveryStatus' of 'Delayed' or where the 'expectedDeliveryDate' has passed. Highlight these as urgent issues.
3.  **Group by Supplier:** Group the items that need to be reordered by their 'supplier'. If a supplier is not listed, group it under "Unknown Supplier".
4.  **Generate Purchase Orders:** For each supplier, create a separate purchase order proposal in markdown format. Each proposal should include:
    *   A clear heading with the supplier's name (e.g., "### Purchase Order for TechSupplier Inc.").
    *   The current date.
    *   A markdown table with the columns: "Item Name", "Current Quantity", "Reorder Quantity", and a "Reason" column explaining why it's being recommended (e.g., "Below Threshold", "High Demand", "Delayed Delivery").
    *   If an item is low on stock and has alternative suppliers listed, add a "Note" suggesting them. For example: "**Note:** Stock is critically low. Consider ordering from alternative suppliers: [Supplier A], [Supplier B]".
    *   A concluding line with a placeholder for a signature.
5.  **Create a Delays Summary:** At the top of the report, create a "## Delivery Alerts" section. List all items that are delayed or past their expected delivery date.
6.  **Combine Proposals:** Combine the delays summary and all generated purchase order proposals into a single markdown string. Separate each section with a horizontal rule (\`---\`).
7.  **Handle No Reorders:** If no items need reordering and there are no delays, the report should clearly state: "All inventory levels are sufficient, and all deliveries are on track. No action is needed at this time."

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
