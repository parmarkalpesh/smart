
'use client';

import { useInventory } from "@/hooks/useInventory";
import Notifications from "../dashboard/Notifications";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsClientPage() {
    const { items } = useInventory();
    
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


    const hasNotifications = lowStockItems.length > 0 || expiringSoonItems.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-6 w-6" />
                    Notifications
                </CardTitle>
                <CardDescription>
                    Items that require your immediate attention.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasNotifications ? (
                    <Notifications items={items} />
                ) : (
                    <p className="text-muted-foreground">You have no new notifications.</p>
                )}
            </CardContent>
        </Card>
    )
}
