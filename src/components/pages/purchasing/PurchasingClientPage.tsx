'use client';

import { useState, useTransition, useRef, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/useInventory';
import { generatePurchaseOrders } from '@/ai/flows/generate-purchase-orders';
import { Wand2, FileText, TriangleAlert, Download, History, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import html2canvas from 'html2canvas';
import html2canvas from 'html2canvas';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';

// Configure marked to disable HTML output entirely
marked.setOptions({
  headerIds: false,
  mangle: false,
  breaks: true,
  gfm: true,
  sanitize: false, // deprecated, but set for clarity
  smartLists: true,
  smartypants: false,
  xhtml: false,
});
// Remove all HTML tags from output by overriding renderer
const renderer = new marked.Renderer();
renderer.html = () => '';
marked.use({ renderer });

export default function PurchasingClientPage() {
  const { items } = useInventory();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  gfm: true,
  sanitize: false, // deprecated, but set for clarity
  smartLists: true,
  smartypants: false,
  xhtml: false,
});
// Remove all HTML tags from output by overriding renderer
const renderer = new marked.Renderer();
renderer.html = () => '';
marked.use({ renderer });

export default function PurchasingClientPage() {
  const { items } = useInventory();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerateReport = () => {
    setError(null);
    setReport(null);

    startTransition(async () => {
      try {
        const result = await generatePurchaseOrders({
          inventoryData: JSON.stringify(items),
        });
        setReport(result.report);
      } catch (e: any) {
        console.error(e);
        let errorMessage = 'Failed to generate purchase orders. Please try again later.';
        if (e.message && e.message.includes('503')) {
            errorMessage = 'The AI model is currently overloaded. Please wait a moment and try again.';
        }
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      }
    });
  };

  // Automatically generate the report on page load
  useEffect(() => {
    handleGenerateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadReport = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;

    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2, // Higher scale for better quality
            backgroundColor: '#ffffff', // Force a white background for the PDF
            onclone: (document) => {
                // Remove dark mode styles from the cloned element for PDF generation
                const clonedElement = document.getElementById(reportElement.id);
                if (clonedElement) {
                  clonedElement.classList.remove('dark:prose-invert');
                  // Ensure table text is visible on white background
                   clonedElement.querySelectorAll('table, th, td').forEach(el => {
                     (el as HTMLElement).style.color = '#000';
                     (el as HTMLElement).style.borderColor = '#e5e7eb';
                   });
                }
            }
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4' // Use a standard page size
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgAspectRatio = canvasWidth / canvasHeight;
        
        let finalWidth, finalHeight;
        
        // Fit image within the A4 page, maintaining aspect ratio
        if (imgAspectRatio > pdfWidth / pdfHeight) {
          finalWidth = pdfWidth;
          finalHeight = finalWidth / imgAspectRatio;
        } else {
          finalHeight = pdfHeight;
          finalWidth = finalHeight * imgAspectRatio;
  };
  
  const reportHtml = useMemo(() => {
    if (!report) return '';
    // marked is now configured to never output HTML tags from user input
    return marked(report) as string;
  }, [report]);


        console.error("Failed to generate PDF", error);
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Could not generate the PDF. Please try again.',
        });
    }
  };
  
  const reportHtml = useMemo(() => {
    if (!report) return '';
    // marked is now configured to never output HTML tags from user input
    return marked(report) as string;
  }, [report]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Purchasing</CardTitle>
          <CardDescription>
            Generate purchase order proposals for items below their reorder threshold or identified as high-demand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateReport} disabled={isPending}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isPending ? 'Generating...' : 'Regenerate Report'}
          </Button>
        </CardContent>
      </Card>

      {isPending && <ReportSkeleton />}

      {error && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error Generating Report</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
             <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={handleGenerateReport}
                disabled={isPending}
            >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isPending ? 'Retrying...' : 'Try Again'}
            </Button>
          </AlertDescription>
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
            <Button variant="outline" onClick={handleDownloadReport} disabled={!reportHtml}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div id="report-content" ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none p-4 bg-background" dangerouslySetInnerHTML={{ __html: reportHtml }}>
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
