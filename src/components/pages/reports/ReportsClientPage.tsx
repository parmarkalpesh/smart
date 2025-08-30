
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';
import { generateInventoryReport } from '@/ai/flows/generate-inventory-report';
import { generateWastageReport } from '@/ai/flows/generate-wastage-report';
import { Wand2, FileText, TriangleAlert, Trash2, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import InventoryChart from './InventoryChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ReportType = 'trends' | 'wastage';

export default function ReportsClientPage() {
  const { items } = useInventory();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentReportType, setCurrentReportType] = useState<ReportType | null>(null);

  const handleGenerateReport = (reportType: ReportType) => {
    setError(null);
    setReport(null);
    setCurrentReportType(reportType);

    startTransition(async () => {
      try {
        let result;
        if (reportType === 'trends') {
          result = await generateInventoryReport({
            inventoryData: JSON.stringify(items),
          });
        } else {
          const wastedItems = items.filter(item => item.status === 'Wasted');
          if (wastedItems.length === 0) {
            setReport("No wasted items found in the inventory to analyze.");
            return;
          }
          result = await generateWastageReport({
            inventoryData: JSON.stringify(wastedItems),
          });
        }
        setReport(result.report);
      } catch (e) {
        console.error(e);
        const errorMessage = `Failed to generate ${reportType} report. Please try again later.`;
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
    if (!report || !currentReportType) return;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentReportType}-report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getReportTitle = (reportType: ReportType | null) => {
    if (reportType === 'trends') return 'Predictive Inventory Analysis';
    if (reportType === 'wastage') return 'Wastage Analysis Report';
    return 'Inventory Analysis Report';
  }

  return (
    <div className="space-y-6">
      <InventoryChart items={items.filter(i => i.status !== 'Wasted')} />

      <Card>
        <CardHeader>
          <CardTitle>Automated Reporting Tool</CardTitle>
          <CardDescription>
            Use our AI-powered tool to analyze your inventory for predictive analytics or past wastage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trends">
                <TrendingUp className="mr-2 h-4 w-4" />
                Predictive Analytics
              </TabsTrigger>
              <TabsTrigger value="wastage">
                <Trash2 className="mr-2 h-4 w-4" />
                Wastage Analysis
              </TabsTrigger>
            </TabsList>
            <TabsContent value="trends" className="pt-4">
               <CardDescription className="mb-4">
                Forecast demand, get optimal stock level suggestions, and receive alerts about potential stockouts before they happen.
              </CardDescription>
              <Button onClick={() => handleGenerateReport('trends')} disabled={isPending}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isPending && currentReportType === 'trends' ? 'Generating...' : 'Generate Predictive Report'}
              </Button>
            </TabsContent>
            <TabsContent value="wastage" className="pt-4">
              <CardDescription className="mb-4">
                Analyze items marked as 'Wasted' to identify patterns and receive recommendations for optimizing future purchases.
              </CardDescription>
              <Button onClick={() => handleGenerateReport('wastage')} disabled={isPending}>
                <Wand2 className="mr-2 h-4 w-4" />
                 {isPending && currentReportType === 'wastage' ? 'Generating...' : 'Generate Wastage Report'}
              </Button>
            </TabsContent>
          </Tabs>
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
                {getReportTitle(currentReportType)}
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
