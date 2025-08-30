
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';
import { generateInventoryReport } from '@/ai/flows/generate-inventory-report';
import { Wand2, FileText, TriangleAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import InventoryChart from './InventoryChart';

export default function ReportsClientPage() {
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
        const result = await generateInventoryReport({
          inventoryData: JSON.stringify(items),
        });
        setReport(result.report);
      } catch (e) {
        console.error(e);
        setError('Failed to generate report. Please try again later.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate the inventory report.',
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
    link.download = 'inventory-report.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
       <InventoryChart items={items} />

      <Card>
        <CardHeader>
          <CardTitle>Automated Reporting Tool</CardTitle>
          <CardDescription>
            Use our AI-powered tool to analyze your current inventory. Get insights
            on stock status, seasonal trends, and restocking recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateReport} disabled={isPending}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isPending ? 'Generating Report...' : 'Generate Inventory Report'}
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
                Inventory Analysis Report
                </CardTitle>
                <CardDescription>
                    Generated on {new Date().toLocaleString()}
                </CardDescription>
            </div>
            <Button variant="outline" onClick={handleDownloadReport}>Download Report</Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-body">
              {report}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReportSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <br/>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
        </Card>
    )
}
