'use client';

import { InventoryItem } from '@/lib/types';
import QRCode from 'react-qr-code';

interface QRCodeComponentProps {
  item: InventoryItem;
}

export default function QRCodeComponent({ item }: QRCodeComponentProps) {
  // We serialize only the ID to keep QR code density low and for security.
  const qrCodeValue = item.id;

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
