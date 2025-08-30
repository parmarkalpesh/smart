'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner, QrCodeSuccessCallback } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { CameraOff, TriangleAlert } from 'lucide-react';
import Link from 'next/link';

interface ScannedItem {
  id: string;
  name: string;
  type: string;
}

const qrcodeRegionId = "html5qr-code-full-region";

export default function QRScanner() {
  const router = useRouter();
  const { toast } = useToast();
  const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    const onScanSuccess: QrCodeSuccessCallback = (decodedText, decodedResult) => {
      try {
        const item = JSON.parse(decodedText) as ScannedItem;
        if (item.id && item.name && item.type) {
            setScannedItem(item);
            setScanError(null);
            toast({
                title: 'Scan Successful!',
                description: `Item "${item.name}" found.`,
            });
            scanner?.clear();
        } else {
            throw new Error("Invalid QR code format.");
        }
      } catch (error) {
        setScannedItem(null);
        setScanError('Failed to parse QR code. Please scan a valid item QR code.');
      }
    };

    const onScanFailure = (error: any) => {
        // This is called frequently, so we don't want to spam the UI.
        // console.warn(`Code scan error = ${error}`);
    };
    
    // Check if the element exists before creating the scanner
    if (document.getElementById(qrcodeRegionId)) {
        scanner = new Html5QrcodeScanner(
            qrcodeRegionId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );
        scanner.render(onScanSuccess, onScanFailure);
    }

    return () => {
      scanner?.clear().catch(error => {
        console.error("Failed to clear html5-qrcode-scanner.", error);
      });
    };
  }, [toast]);

  const resetScanner = () => {
    setScannedItem(null);
    setScanError(null);
    // This re-triggers the useEffect to re-render the scanner
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div id={qrcodeRegionId} className="w-full" />

      {scanError && (
        <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Scan Error</AlertTitle>
            <AlertDescription>{scanError}</AlertDescription>
        </Alert>
      )}

      {scannedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Scanned Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">{scannedItem.name}</span>
                    <Badge variant="secondary">{scannedItem.type}</Badge>
                </div>
                <Separator/>
                <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground">Item ID</span>
                    <span className="font-mono text-xs">{scannedItem.id}</span>
                </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={resetScanner} variant="outline" className="w-full">Scan Another</Button>
              <Link href={`/item/${scannedItem.id}`} passHref className="w-full">
                <Button className="w-full">View Full Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!scannedItem && !scanError && (
          <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg flex flex-col items-center justify-center">
            <CameraOff className="h-10 w-10 mb-4" />
            <p>Awaiting QR Code Scan</p>
            <p className="text-xs">Scanner will start automatically.</p>
          </div>
      )}
    </div>
  );
}
