
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';
import { InventoryItem } from '@/lib/types';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface InventoryChartProps {
  items: InventoryItem[];
}

export default function InventoryChart({ items }: InventoryChartProps) {
  const chartData = useMemo(() => {
    const dataByType = items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = { type: item.type, quantity: 0 };
      }
      acc[item.type].quantity += item.quantity;
      return acc;
    }, {} as { [key: string]: { type: string; quantity: number } });

    return Object.values(dataByType);
  }, [items]);

  const chartConfig = {
    quantity: {
      label: "Quantity",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;


  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No data available to display a chart.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Distribution</CardTitle>
        <CardDescription>Total quantity of items by type</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="type"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 15)}
                />
                <YAxis />
                <Tooltip 
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
