

export type ItemStatus = 'Available' | 'Checked Out' | 'In Maintenance' | 'Low Stock' | 'Wasted';
export type DeliveryStatus = 'Ordered' | 'Shipped' | 'Delayed' | 'Delivered' | 'Pending';


export interface VoiceNote {
  id: string;
  audioDataUri: string;
  transcription: string;
  summary: string;
  createdAt: string; // ISO string
}

export interface InventoryItem {
  id:string;
  name: string;
  type: string;
  dateAdded: string; // ISO string
  status: ItemStatus;
  quantity: number;
  imageUrl?: string;
  expiryDate?: string; // ISO string for expiry
  location?: string;
  supplier?: string;
  nextMaintenanceDate?: string; // ISO string for maintenance
  voiceNotes?: VoiceNote[];
  reorderThreshold?: number;
  reorderQuantity?: number;
}

export interface GoogleUser {
    name: string;
    email: string;
    picture: string;
}
