import AppLayout from "@/components/AppLayout";
import QRScanner from "@/components/QRScanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScannerPage() {
    return (
        <AppLayout>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Scan Inventory Item</CardTitle>
                    <CardDescription>Position the QR code inside the frame to scan it. The item details will be displayed below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <QRScanner />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
