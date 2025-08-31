
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';
import { generateAnalyticsInsights, GenerateAnalyticsInsightsOutput } from '@/ai/flows/generate-analytics-insights';
import { Wand2, TriangleAlert, RefreshCw, BarChart2, TrendingDown, TrendingUp, AlertTriangle, PackageSearch, Hourglass, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import MostStockedChart from './MostStockedChart';
import LowStockChart from './LowStockChart';
import Link from 'next/link';

export default function AnalyticsClientPage() {
  const { items } = useInventory();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [insights, setInsights] = useState<GenerateAnalyticsInsightsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = () => {
    setError(null);
    setInsights(null);

    startTransition(async () => {
      try {
        const result = await generateAnalyticsInsights({
          inventoryData: JSON.stringify(items),
        });
        setInsights(result);
      } catch (e: any) {
        console.error(e);
        let errorMessage = 'Failed to generate insights. Please try again later.';
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

  // Automatically generate insights on page load
  useEffect(() => {
    handleGenerateInsights();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart2 /> Advanced Analytics</CardTitle>
          <CardDescription>
            Generate predictive KPIs and interactive graphs for deeper inventory insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateInsights} disabled={isPending}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isPending ? 'Analyzing...' : 'Re-analyze Inventory'}
          </Button>
        </CardContent>
      </Card>

      {isPending && <AnalyticsSkeleton />}

      {error && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error Generating Insights</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
             <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={handleGenerateInsights}
                disabled={isPending}
            >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isPending ? 'Retrying...' : 'Try Again'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MostStockedChart items={items} />
        <LowStockChart items={items} />
    </div>

      {insights && (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><AlertTriangle /> Forecasted Stockouts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {insights.forecastedStockouts.length > 0 ? (
                        insights.forecastedStockouts.map(item => (
                            <Alert key={item.name}>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>{item.name} (Qty: {item.quantity})</AlertTitle>
                                <AlertDescription>{item.insight}</AlertDescription>
                            </Alert>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No immediate stockouts forecasted. Well done!</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><TrendingUp /> Fast-Moving Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       {insights.topSellingItems.map(item => (
                            <div key={item.name} className="text-sm p-3 bg-muted/50 rounded-lg">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-muted-foreground text-xs">{item.insight}</p>
                            </div>
                       ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><TrendingDown /> Slow-Moving Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       {insights.slowMovingStock.map(item => (
                            <div key={item.name} className="text-sm p-3 bg-muted/50 rounded-lg">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-muted-foreground text-xs">{item.insight}</p>
                            </div>
                       ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><Hourglass /> Reorder & Seasonal Trends</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <h4 className='font-semibold mb-1'>Reorder Trends</h4>
                            <p className="text-sm text-muted-foreground">{insights.reorderTrends}</p>
                        </div>
                        <Separator />
                         <div>
                            <h4 className='font-semibold mb-1'>Seasonal Trends</h4>
                            <p className="text-sm text-muted-foreground">{insights.seasonalTrends}</p>
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button variant="outline" asChild>
                            <Link href="/purchasing">Go to Purchasing</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
           
        </div>
      )}
    </div>
  );
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                         <Separator />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}
