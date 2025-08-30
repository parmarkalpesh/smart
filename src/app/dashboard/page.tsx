import AppLayout from '@/components/AppLayout';
import InventoryClientPage from '@/components/pages/dashboard/InventoryClientPage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>View, manage, and track all your items in real-time.</CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryClientPage />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
