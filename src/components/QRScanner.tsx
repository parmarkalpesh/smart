
'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import type { QrCodeSuccessCallback, Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Camera, TriangleAlert, Loader2, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem } from '@/lib/types';
import Image from 'next/image';

export default function QRScanner() {
  const router = useRouter();
  const { toast } = useToast();
  const { getItemById } = useInventory();
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const videoContainerId = "video-container";

  useEffect(() => {
    if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode(videoContainerId, { verbose: false });
    }
    const html5Qrcode = html5QrcodeRef.current;
    let isComponentMounted = true;

    const onScanSuccess: QrCodeSuccessCallback = (decodedText, decodedResult) => {
        if (!html5Qrcode.isScanning) return;
        
        try {
            const item = getItemById(decodedText);
            if (item) {
                toast({
                    title: 'Scan Successful!',
                    description: `Item "${item.name}" found.`,
                });
                setScannedItem(item);
                setScanError(null);
            } else {
                setScannedItem(null);
                setScanError('Item not found in inventory. Please scan a valid item QR code.');
            }
        } catch (error) {
            setScannedItem(null);
            setScanError('Failed to parse QR code. Please scan a valid item QR code.');
        } finally {
            if (html5Qrcode.isScanning) {
                html5Qrcode.stop().then(() => setIsScannerActive(false));
            }
        }
    };

    const onScanFailure = (error: any) => {
        // This is called frequently, so we don't want to spam the UI.
        // We can add more robust error handling here if needed.
    };

    const startScanner = async () => {
        if (!isComponentMounted || html5Qrcode.isScanning) return;

        try {
            await Html5Qrcode.getCameras();
        } catch (err) {
            setScanError('Camera not found or permission denied. Please grant camera permissions in your browser settings.');
            return;
        }
        
        try {
            const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                const qrboxSize = Math.floor(minEdge * 0.8);
                return { width: qrboxSize, height: qrboxSize };
            };

            await html5Qrcode.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: qrboxFunction },
                onScanSuccess,
                onScanFailure
            );
            if (isComponentMounted) {
                setIsScannerActive(true);
                setScanError(null);
            }
        } catch (error) {
             if (isComponentMounted) {
                setScanError('Could not start camera. Please ensure permissions are granted and try again.');
             }
        }
    };
    
    if (!scannedItem) {
        startScanner();
    }

    return () => {
      isComponentMounted = false;
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(err => {
            console.error("Failed to stop scanner cleanly", err);
        });
      }
    };
  }, [scannedItem, getItemById, toast]);


  const resetScanner = () => {
    setScannedItem(null);
    setScanError(null);
  };
  
  if (scannedItem) {
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Item Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {scannedItem.imageUrl ? (
                     <div className="relative w-full aspect-video">
                        <Image src={scannedItem.imageUrl} alt={scannedItem.name} fill className="rounded-md object-cover" />
                    </div>
                ) : (
                    <div className="aspect-video flex items-center justify-center bg-muted rounded-md">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                )}
                <Separator />
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{scannedItem.name}</h3>
                    <p className="text-muted-foreground">{scannedItem.type}</p>
                    <div className="flex items-center justify-between pt-2">
                        <Badge>{scannedItem.status}</Badge>
                        <p>Quantity: <span className="font-bold">{scannedItem.quantity}</span></p>
                    </div>
                </div>
                 <Separator />
                 <div className="flex gap-2">
                    <Button onClick={resetScanner} variant="outline" className="w-full">Scan Another Item</Button>
                    <Button asChild className="w-full">
                        <Link href={`/item/${scannedItem.id}`}>View Full Details</Link>
                    </Button>
                 </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-4">
        <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
            <div id={videoContainerId} className="w-full h-full" />
            
            {!isScannerActive && !scanError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 text-center">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Initializing Camera...</span>
                    </div>
                </div>
            )}
        </div>

        {scanError && (
            <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Scanner Error</AlertTitle>
                <AlertDescription>{scanError}</AlertDescription>
            </Alert>
        )}

        {(isScannerActive && !scanError) && (
            <div className="text-center text-muted-foreground">
                <p>Position the QR code inside the frame.</p>
            </div>
        )}
    </div>
  );
}
