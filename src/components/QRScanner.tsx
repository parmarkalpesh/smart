
'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import type { QrCodeSuccessCallback } from 'html5-qrcode';
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
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  const onScanSuccess: QrCodeSuccessCallback = (decodedText, decodedResult) => {
    stopScanner();
    try {
      const item = getItemById(decodedText);
      if (item) {
        setScannedItem(item);
        setScanError(null);
        toast({
          title: 'Scan Successful!',
          description: `Item "${item.name}" found.`,
        });
      } else {
         setScannedItem(null);
        setScanError('Item not found in inventory. Please scan a valid item QR code.');
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

  const startScanner = async () => {
    if (isScannerActive || !videoRef.current || !scannerRef.current) return;
    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
      );
      setIsScannerActive(true);
      setScanError(null);
    } catch (error) {
      console.error('Error starting scanner:', error);
      setHasCameraPermission(false);
      setScanError('Could not start camera. Please grant camera permissions.');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        setIsScannerActive(false);
      }).catch(err => {
        console.error("Failed to stop scanner", err);
      });
    }
  };
  
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        await Html5Qrcode.getCameras();
        setHasCameraPermission(true);
        
        if (videoRef.current) {
            const qrScanner = new Html5Qrcode(videoRef.current.id, {
                verbose: false,
            });
            scannerRef.current = qrScanner;
            if (!scannedItem) {
              startScanner();
            }
        }
      } catch (err) {
        console.error('Failed to get cameras', err);
        setHasCameraPermission(false);
        setScanError('Camera not found or permission denied. Please grant camera permissions.');
      }
    };
    initializeScanner();
    
    return () => {
        if(scannerRef.current && scannerRef.current.isScanning) {
            stopScanner();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedItem]);

  const resetScanner = () => {
    setScannedItem(null);
    setScanError(null);
    // The useEffect will handle restarting the scanner
  };
  
  return (
    <div className="space-y-4">
        <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
            <div id="video-container" ref={videoRef} className="w-full h-full" />
            
            {!isScannerActive && !scannedItem && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 text-center">
                    {hasCameraPermission === null && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Checking for camera...</span>
                      </div>
                    )}
                    {hasCameraPermission === false && (
                         <Alert variant="destructive" className="bg-destructive/80 border-0 text-white max-w-sm">
                            <TriangleAlert className="h-4 w-4 text-white" />
                            <AlertTitle>Camera Access Denied</AlertTitle>
                            <AlertDescription>
                                Please enable camera permissions in your browser settings to use the scanner.
                            </AlertDescription>
                        </Alert>
                    )}
                     {hasCameraPermission === true && (
                      <div className="flex items-center gap-2">
                         <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Starting camera...</span>
                      </div>
                    )}
                </div>
            )}
        </div>

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
                 {scannedItem.imageUrl ? (
                    <div className="aspect-video relative">
                        <Image src={scannedItem.imageUrl} alt={scannedItem.name} fill className="rounded-md object-cover" />
                    </div>
                ) : (
                    <div className="aspect-video flex items-center justify-center bg-muted rounded-md">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                )}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-lg">{scannedItem.name}</span>
                        <Badge variant="secondary">{scannedItem.type}</Badge>
                    </div>
                     <Separator/>
                     <div className="flex justify-between items-center pt-2">
                        <span className="text-muted-foreground">Status</span>
                        <Badge>{scannedItem.status}</Badge>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Quantity</span>
                        <span>{scannedItem.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Item ID</span>
                        <span className="font-mono text-xs">{scannedItem.id}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Date Added</span>
                        <span>{new Date(scannedItem.dateAdded).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                <Button onClick={resetScanner} variant="outline" className="w-full">Scan Another</Button>
                <Button asChild className="w-full">
                    <Link href={`/item/${scannedItem.id}`}>View Full Details</Link>
                </Button>
                </div>
            </CardContent>
            </Card>
        )}
    </div>
  );
}
