'use client';

import { InventoryItem } from '@/lib/types';
import useLocalStorage from './useLocalStorage';

const initialDemoData: InventoryItem[] = [
  { id: '1', name: 'Laptop Pro', type: 'Electronics', dateAdded: new Date().toISOString(), status: 'Available', quantity: 10, imageUrl: 'https://picsum.photos/400/300?id=1' },
  { id: '2', name: 'Office Chair', type: 'Furniture', dateAdded: new Date().toISOString(), status: 'Checked Out', quantity: 1, imageUrl: 'https://picsum.photos/400/300?id=2' },
  { id: '3', name: 'Wireless Mouse', type: 'Accessories', dateAdded: new Date().toISOString(), status: 'Low Stock', quantity: 3, imageUrl: 'https://picsum.photos/400/300?id=3' },
  { id: '4', name: 'Projector', type: 'Electronics', dateAdded: new Date().toISOString(), status: 'In Maintenance', quantity: 1, imageUrl: 'https://picsum.photos/400/300?id=4' },
];


export function useInventory() {
  const [items, setItems] = useLocalStorage<InventoryItem[]>('inventory', initialDemoData);

  const addItem = (item: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
    };
    setItems([...items, newItem]);
    return newItem;
  };

  const updateItem = (id: string, updatedItem: Partial<InventoryItem>) => {
    setItems(items.map(item => (item.id === id ? { ...item, ...updatedItem } : item)));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getItemById = (id: string) => {
    return items.find(item => item.id === id);
  };

  return { items, setItems, addItem, updateItem, deleteItem, getItemById };
}
