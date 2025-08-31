
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventory } from '@/hooks/useInventory';
import { useRouter } from 'next/navigation';
import { InventoryItem, ItemStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

// Helper to format date for input[type="date"]
const formatDateForInput = (date?: Date | string) => {
  if (!date) return '';
  // If it's already a string in YYYY-MM-DD format, return it
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  type: z.string().min(2, { message: 'Type must be at least 2 characters.' }),
  quantity: z.coerce.number().min(0, { message: 'Quantity cannot be negative.' }),
  status: z.enum(['Available', 'Checked Out', 'In Maintenance', 'Low Stock', 'Wasted']),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  expiryDate: z.string().optional(),
  location: z.string().optional(),
  supplier: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
  reorderThreshold: z.coerce.number().min(0).optional(),
  reorderQuantity: z.coerce.number().min(0).optional(),
  shelfId: z.string().optional(),
  weight: z.coerce.number().min(0).optional(),
});

type InventoryFormValues = z.infer<typeof formSchema>;

interface InventoryItemFormProps {
  item?: InventoryItem;
}

export default function InventoryItemForm({ item }: InventoryItemFormProps) {
  const router = useRouter();
  const { addItem, updateItem } = useInventory();
  const { toast } = useToast();
  const isEditMode = !!item;

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || '',
      type: item?.type || '',
      quantity: item?.quantity || 0,
      status: item?.status || 'Available',
      imageUrl: item?.imageUrl || '',
      expiryDate: item?.expiryDate ? formatDateForInput(item.expiryDate) : '',
      location: item?.location || '',
      supplier: item?.supplier || '',
      nextMaintenanceDate: item?.nextMaintenanceDate ? formatDateForInput(item.nextMaintenanceDate) : '',
      reorderThreshold: item?.reorderThreshold || undefined,
      reorderQuantity: item?.reorderQuantity || undefined,
      shelfId: item?.shelfId || '',
      weight: item?.weight || undefined,
    },
  });

  const [imagePreview, setImagePreview] = useState<string | undefined>(item?.imageUrl);
  const [isImageValid, setIsImageValid] = useState(true);

  function onSubmit(values: InventoryFormValues) {
    const itemData = {
      ...values,
      // Ensure empty strings are not converted to invalid dates
      expiryDate: values.expiryDate ? new Date(values.expiryDate).toISOString() : undefined,
      nextMaintenanceDate: values.nextMaintenanceDate ? new Date(values.nextMaintenanceDate).toISOString() : undefined,
    };

    if (isEditMode && item) {
      updateItem(item.id, itemData);
      toast({ title: 'Item Updated', description: `"${values.name}" has been successfully updated.` });
      router.push(`/item/${item.id}`);
    } else {
      const newItem = addItem(itemData);
      toast({ title: 'Item Added', description: `"${values.name}" has been added to inventory.` });
      router.push(`/item/${newItem.id}`);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    form.setValue('imageUrl', value);
    if(value === '') {
        setImagePreview(undefined);
        setIsImageValid(true);
        return;
    }
    try {
        new URL(value);
        setImagePreview(value);
        setIsImageValid(true);
    } catch {
        setImagePreview(undefined);
        setIsImageValid(false);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Main Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Item Name</FormLabel> <FormControl> <Input placeholder="e.g. MacBook Pro 16-inch" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>Item Type</FormLabel> <FormControl> <Input placeholder="e.g. Electronics" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="quantity" render={({ field }) => ( <FormItem> <FormLabel>Quantity</FormLabel> <FormControl> <Input type="number" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select a status" /> </SelectTrigger> </FormControl> <SelectContent> {(['Available', 'Checked Out', 'In Maintenance', 'Low Stock', 'Wasted'] as ItemStatus[]).map( (status) => ( <SelectItem key={status} value={status}> {status} </SelectItem> ) )} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location</FormLabel> <FormControl> <Input placeholder="e.g. Warehouse A, Shelf 3" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="supplier" render={({ field }) => ( <FormItem> <FormLabel>Supplier</FormLabel> <FormControl> <Input placeholder="e.g. Supplier Inc." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            </div>
        </div>

        <Separator />

        <div className="space-y-4">
            <h3 className="text-lg font-medium">IoT & Sensor Data (Simulation)</h3>
             <div className="grid md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="shelfId" render={({ field }) => ( <FormItem> <FormLabel>Shelf ID</FormLabel> <FormControl> <Input placeholder="e.g. SH-01-A" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                 <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem> <FormLabel>Weight per Unit (grams)</FormLabel> <FormControl> <Input type="number" placeholder="e.g. 1800" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            </div>
        </div>

        <Separator />
        
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Purchasing Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="reorderThreshold" render={({ field }) => ( <FormItem> <FormLabel>Reorder Threshold</FormLabel> <FormControl> <Input type="number" placeholder="e.g. 10" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="reorderQuantity" render={({ field }) => ( <FormItem> <FormLabel>Reorder Quantity</FormLabel> <FormControl> <Input type="number" placeholder="e.g. 50" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            </div>
        </div>

        <Separator />

        <div className="space-y-4">
            <h3 className="text-lg font-medium">Dates</h3>
            <div className="grid md:grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="w-[240px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                  control={form.control}
                  name="nextMaintenanceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Maintenance Date</FormLabel>
                       <FormControl>
                        <Input type="date" {...field} className="w-[240px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
        </div>

        <Separator />

         <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/image.png"
                  {...field}
                  onChange={handleImageChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {imagePreview && isImageValid && (
          <div>
             <FormLabel>Image Preview</FormLabel>
            <div className="mt-2 relative aspect-video w-full max-w-sm">
                <Image src={imagePreview} alt="Item Preview" fill className="rounded-md object-cover" />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Add Item'}</Button>
        </div>
      </form>
    </Form>
  );
}
