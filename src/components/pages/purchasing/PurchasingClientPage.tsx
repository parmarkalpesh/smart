
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';
import { generatePurchaseOrders } from '@/ai/flows/generate-purchase-orders';
import { Wand2, FileText, TriangleAlert, Download, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function PurchasingClientPage() {
  const { items } = useInventory();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = () => {
    setError(null);
    setReport(null);

    startTransition(async () => {
      try {
        const result = await generatePurchaseOrders({
          inventoryData: JSON.stringify(items),
        });
        setReport(result.report);
      } catch (e) {
        console.error(e);
        const errorMessage = `Failed to generate purchase orders. Please try again later.`;
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      }
    });
  };

  const handleDownloadReport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Reordering</CardTitle>
          <CardDescription>
            Automatically generate purchase order proposals for items that have fallen below their reorder threshold.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateReport} disabled={isPending}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isPending ? 'Generating...' : 'Generate Purchase Orders'}
          </Button>
        </CardContent>
      </Card>

      {isPending && <ReportSkeleton />}

      {error && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {report && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Purchase Order Proposals
                </CardTitle>
                <CardDescription>
                    Generated on {new Date().toLocaleString()}
                </CardDescription>
            </div>
            <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-body">
              {report}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6" />
                Purchase History
            </CardTitle>
            <CardDescription>
                Review past purchase orders and their status.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Purchase history is not yet available.</p>
                <p className="text-xs text-muted-foreground/80">This is a placeholder for a future enhancement.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Separator />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
        </Card>
    )
}
