
'use client';

import { useInventory } from "@/hooks/useInventory";
import Notifications from "../dashboard/Notifications";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsClientPage() {
    const { items } = useInventory();
    
    const hasNotifications = useMemo(() => {
        const lowStock = items.some(item => item.status === 'Low Stock' || (item.quantity > 0 && item.quantity <= 5));
        
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringSoon = items.some(item => {
            if (!item.expiryDate) return false;
            const expiryDate = new Date(item.expiryDate);
            return expiryDate > new Date() && expiryDate <= thirtyDaysFromNow;
        });

        const maintenanceDue = items.some(item => {
            if (!item.nextMaintenanceDate) return false;
            const maintenanceDate = new Date(item.nextMaintenanceDate);
            return maintenanceDate > new Date() && maintenanceDate <= thirtyDaysFromNow;
        });

        return lowStock || expiringSoon || maintenanceDue;
    }, [items]);

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
