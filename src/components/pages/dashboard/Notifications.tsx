
'use client';

import { useMemo } from 'react';
import { InventoryItem } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, TriangleAlert, CalendarClock, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface NotificationsProps {
  items: InventoryItem[];
}

export default function Notifications({ items }: NotificationsProps) {
  const lowStockItems = useMemo(() => {
    return items.filter(
      (item) => item.status === 'Low Stock' || (item.reorderThreshold && item.quantity <= item.reorderThreshold)
    );
  }, [items]);

  const thirtyDaysFromNow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }, []);

  const expiringSoonItems = useMemo(() => {
    return items.filter(item => {
        if (!item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        return expiryDate > new Date() && expiryDate <= thirtyDaysFromNow;
    });
  }, [items, thirtyDaysFromNow]);
  
  const maintenanceDueItems = useMemo(() => {
    return items.filter(item => {
      if (!item.nextMaintenanceDate) return false;
      const maintenanceDate = new Date(item.nextMaintenanceDate);
      return maintenanceDate > new Date() && maintenanceDate <= thirtyDaysFromNow;
    });
  }, [items, thirtyDaysFromNow]);

  if (lowStockItems.length === 0 && expiringSoonItems.length === 0 && maintenanceDueItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
        {lowStockItems.length > 0 && (
            <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Low Stock Alert</AlertTitle>
            <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-2">
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
                    <ul className="list-disc list-inside mt-2 space-y-2">
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

        {maintenanceDueItems.length > 0 && (
             <Alert>
                <Wrench className="h-4 w-4" />
                <AlertTitle>Maintenance Due</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-2">
                    {maintenanceDueItems.map(item => (
                        <li key={item.id} className="flex justify-between items-center">
                        <span>
                            {item.name} requires maintenance by {new Date(item.nextMaintenanceDate!).toLocaleDateString()}.
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
    </div>

  );
}
