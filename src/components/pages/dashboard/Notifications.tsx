
'use client';

import { useMemo } from 'react';
import { InventoryItem } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, TriangleAlert, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface NotificationsProps {
  items: InventoryItem[];
}

export default function Notifications({ items }: NotificationsProps) {
  const lowStockItems = useMemo(() => {
    return items.filter(
      (item) => item.status === 'Low Stock' || (item.quantity > 0 && item.quantity <= 5)
    );
  }, [items]);

  const expiringSoonItems = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return items.filter(item => {
        if (!item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        return expiryDate > new Date() && expiryDate <= thirtyDaysFromNow;
    });
  }, [items]);

  if (lowStockItems.length === 0 && expiringSoonItems.length === 0) {
    return null;
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {lowStockItems.length > 0 && (
            <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Low Stock Alert</AlertTitle>
            <AlertDescription>
                <ul className="list-disc list-inside mt-2">
                {lowStockItems.map(item => (
                    <li key={item.id} className="flex justify-between items-center">
                    <span>
                        {item.name} has only {item.quantity} unit(s) left.
                    </span>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/item/${item.id}`}>View Item</Link>
                    </Button>
                    </li>
                ))}
                </ul>
            </AlertDescription>
            </Alert>
        )}

        {expiringSoonItems.length > 0 && (
            <Alert>
                <CalendarClock className="h-4 w-4" />
                <AlertTitle>Expiry Alert</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside mt-2">
                    {expiringSoonItems.map(item => (
                        <li key={item.id} className="flex justify-between items-center">
                        <span>
                            {item.name} will expire on {new Date(item.expiryDate!).toLocaleDateString()}.
                        </span>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/item/${item.id}`}>View Item</Link>
                        </Button>
                        </li>
                    ))}
                    </ul>
                </AlertDescription>
            </Alert>
        )}
        </CardContent>
    </Card>

  );
}
