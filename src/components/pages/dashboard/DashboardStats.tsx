'use client';

import { InventoryItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Boxes, Package, PackageCheck, TriangleAlert } from 'lucide-react';
import { useMemo } from 'react';

interface DashboardStatsProps {
  items: InventoryItem[];
}

export default function DashboardStats({ items }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = items.filter(
      (item) => item.status === 'Low Stock' || (item.quantity > 0 && item.quantity <= 5)
    ).length;
    const outOfStockItems = items.filter((item) => item.quantity === 0).length;

    return { totalItems, totalQuantity, lowStockItems, outOfStockItems };
  }, [items]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Boxes className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
          <p className="text-xs text-muted-foreground">Unique items in inventory</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalQuantity}</div>
          <p className="text-xs text-muted-foreground">Total units in stock</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          <TriangleAlert className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.lowStockItems}</div>
          <p className="text-xs text-muted-foreground">Items needing attention</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          <PackageCheck className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.outOfStockItems}</div>
          <p className="text-xs text-muted-foreground">Items to restock immediately</p>
        </CardContent>
      </Card>
    </div>
  );
}
