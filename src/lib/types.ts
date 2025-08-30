
export type ItemStatus = 'Available' | 'Checked Out' | 'In Maintenance' | 'Low Stock' | 'Wasted';

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  dateAdded: string; // ISO string
  status: ItemStatus;
  quantity: number;
  imageUrl?: string;
  expiryDate?: string; // ISO string for expiry
  location?: string;
  supplier?: string;
}

export interface GoogleUser {
    name: string;
    email: string;
    picture: string;
}
