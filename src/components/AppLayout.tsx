
'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ScanLine,
  BarChart2,
  QrCode,
  Power,
  Bell,
} from 'lucide-react';
import { Separator } from './ui/separator';
import { useInventory } from '@/hooks/useInventory';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { items } = useInventory();

  const notificationCount = useMemo(() => {
    const lowStockItems = items.filter(
      (item) => item.status === 'Low Stock' || (item.quantity > 0 && item.quantity <= 5)
    );

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringSoonItems = items.filter(item => {
        if (!item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        return expiryDate > new Date() && expiryDate <= thirtyDaysFromNow;
    });

    return lowStockItems.length + expiringSoonItems.length;
  }, [items]);


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 bg-primary/20 text-primary">
              <QrCode />
            </Button>
            <span className="font-headline text-lg font-semibold text-sidebar-foreground">
              Inventory Ace
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/')}
                tooltip="Dashboard"
              >
                <Link href="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/scanner')}
                tooltip="Scan Item"
              >
                <Link href="/scanner">
                  <ScanLine />
                  <span>Scan Item</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/notifications')}
                tooltip="Notifications"
              >
                <Link href="/notifications">
                  <Bell />
                  <span>Notifications</span>
                   {notificationCount > 0 && <SidebarMenuBadge>{notificationCount}</SidebarMenuBadge>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/reports')}
                tooltip="AI Reports"
              >
                <Link href="/reports">
                  <BarChart2 />
                  <span>AI Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2 bg-sidebar-border" />
          <Button variant="ghost" className="w-full justify-start gap-2" disabled>
            <Power />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-14 items-center border-b bg-card px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold capitalize font-headline">
            {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h1>
        </div>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
