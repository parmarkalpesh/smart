'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScanner, QrCodeSuccessCallback } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Camera, CameraOff, TriangleAlert } from 'lucide-react';
import Link from 'next/link';

interface ScannedItem {
  id: string;
  name: string;
  type: string;
}

export default function QRScanner() {
  const router = useRouter();
  const { toast } = useToast();
  const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  const onScanSuccess: QrCodeSuccessCallback = (decodedText, decodedResult) => {
    stopScanner();
    try {
      const item = JSON.parse(decodedText) as ScannedItem;
      if (item.id && item.name && item.type) {
        setScannedItem(item);
        setScanError(null);
        toast({
          title: 'Scan Successful!',
          description: `Item "${item.name}" found.`,
        });
      } else {
        throw new Error('Invalid QR code format.');
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
    if (isScannerActive || !videoRef.current) return;
    try {
      await Html5Qrcode.getCameras();
      setHasCameraPermission(true);
      
      const qrScanner = new Html5Qrcode(videoRef.current.id);
      scannerRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
      );
      setIsScannerActive(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      setHasCameraPermission(false);
      setScanError('Could not start camera. Please grant camera permissions.');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && isScannerActive) {
      scannerRef.current.stop().then(() => {
        setIsScannerActive(false);
      }).catch(err => {
        console.error("Failed to stop scanner", err);
      });
    }
  };
  
  useEffect(() => {
    const requestPermission = async () => {
       try {
        await Html5Qrcode.getCameras();
        setHasCameraPermission(true);
      } catch (err) {
        setHasCameraPermission(false);
      }
    };
    requestPermission();
    
    // Cleanup on component unmount
    return () => {
        if(scannerRef.current && scannerRef.current.isScanning) {
            stopScanner();
        }
    };
  }, []);

  const resetScanner = () => {
    setScannedItem(null);
    setScanError(null);
    startScanner();
  };
  
  return (
    <div className="space-y-4">
        <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
            <div id="video-container" ref={videoRef} className="w-full h-full" />

            {!isScannerActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                    {hasCameraPermission === null && <p>Checking camera permissions...</p>}
                    {hasCameraPermission === false && (
                         <Alert variant="destructive" className="bg-destructive/80 border-0 text-white">
                            <TriangleAlert className="h-4 w-4 text-white" />
                            <AlertTitle>Camera Access Denied</AlertTitle>
                            <AlertDescription>
                                Please enable camera permissions in your browser settings to use the scanner.
                            </AlertDescription>
                        </Alert>
                    )}
                    {hasCameraPermission && !scannedItem && (
                        <Button onClick={startScanner} size="lg">
                            <Camera className="mr-2 h-5 w-5" />
                            Start Scanning
                        </Button>
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
