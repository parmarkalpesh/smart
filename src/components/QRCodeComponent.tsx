'use client';

import { InventoryItem } from '@/lib/types';
import QRCode from 'react-qr-code';

interface QRCodeComponentProps {
  item: InventoryItem;
}

// Simple hash function (FNV-1a) for obfuscating the ID without new dependencies
function hashId(id: string): string {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  // Convert to hex string
  return (hash >>> 0).toString(16);
}

export default function QRCodeComponent({ item }: QRCodeComponentProps) {
  // Use a hashed version of the ID to avoid exposing internal identifiers directly
  const qrCodeValue = hashId(item.id);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <QRCode
        value={qrCodeValue}
        size={160}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        viewBox={`0 0 256 256`}
      />
    </div>
  );
}
