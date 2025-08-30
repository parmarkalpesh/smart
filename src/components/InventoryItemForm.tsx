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

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  type: z.string().min(2, { message: 'Type must be at least 2 characters.' }),
  quantity: z.coerce.number().min(0, { message: 'Quantity cannot be negative.' }),
  status: z.enum(['Available', 'Checked Out', 'In Maintenance', 'Low Stock']),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
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
    },
  });

  const [imagePreview, setImagePreview] = useState<string | undefined>(item?.imageUrl);
  const [isImageValid, setIsImageValid] = useState(true);

  function onSubmit(values: InventoryFormValues) {
    if (isEditMode && item) {
      updateItem(item.id, values);
      toast({ title: 'Item Updated', description: `"${values.name}" has been successfully updated.` });
      router.push(`/item/${item.id}`);
    } else {
      const newItem = addItem(values);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. MacBook Pro 16-inch" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Electronics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(['Available', 'Checked Out', 'In Maintenance', 'Low Stock'] as ItemStatus[]).map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Add Item'}</Button>
        </div>
      </form>
    </Form>
  );
}
