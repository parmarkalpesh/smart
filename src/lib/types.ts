export type ItemStatus = 'Available' | 'Checked Out' | 'In Maintenance' | 'Low Stock';

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  dateAdded: string; // ISO string
  status: ItemStatus;
  quantity: number;
  imageUrl?: string;
}

export interface GoogleUser {
    name: string;
    email: string;
    picture: string;
}
