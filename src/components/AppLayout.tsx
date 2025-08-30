
'use client';

import React, { useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  Shield,
  User
} from 'lucide-react';
import { Separator } from './ui/separator';
import { useInventory } from '@/hooks/useInventory';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from './ui/skeleton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);


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

    const maintenanceDueItems = items.filter(item => {
        if (!item.nextMaintenanceDate) return false;
        const maintenanceDate = new Date(item.nextMaintenanceDate);
        return maintenanceDate > new Date() && maintenanceDate <= thirtyDaysFromNow;
    });

    return lowStockItems.length + expiringSoonItems.length + maintenanceDueItems.length;
  }, [items]);

  const handleLogout = () => {
    logout();
  }

  if (loading || !user) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <QrCode className="h-10 w-10 animate-pulse text-primary" />
                <p className="text-muted-foreground">Loading Your Workspace...</p>
            </div>
        </div>
    );
  }


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
                isActive={isActive('/dashboard')}
                tooltip="Dashboard"
              >
                <Link href="/dashboard">
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
          <div className="flex items-center p-2 text-sm text-sidebar-foreground/70">
            {user.role === 'admin' ? <Shield className="mr-2" /> : <User className="mr-2" />}
            <span className="font-medium capitalize">{user.role}</span>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
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
