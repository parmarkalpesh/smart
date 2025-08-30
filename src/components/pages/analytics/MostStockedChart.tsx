'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryItem } from '@/lib/types';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';


interface MostStockedChartProps {
  items: InventoryItem[];
}

const chartConfig = {
  quantity: {
    label: 'Quantity',
  },
};

export default function MostStockedChart({ items }: MostStockedChartProps) {
  const chartData = useMemo(() => {
    return items
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
      }));
  }, [items]);

   if (chartData.length === 0) {
    return (
        <Card>
             <CardHeader>
                <CardTitle>Top 5 Most Stocked Items</CardTitle>
                <CardDescription>Your most abundant items in the inventory.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No inventory data to display.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Most Stocked Items</CardTitle>
        <CardDescription>Your most abundant items in the inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="quantity" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
