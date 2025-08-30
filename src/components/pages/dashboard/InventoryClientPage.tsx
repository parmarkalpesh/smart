
'use client';

import { useInventory } from '@/hooks/useInventory';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import DashboardStats from './DashboardStats';
import { useEffect, useState } from 'react';

export default function InventoryClientPage() {
  const { items, deleteItem } = useInventory();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // You can render a skeleton loader here if you want
    return null; 
  }

  return (
    <div className="space-y-4">
      <DashboardStats items={items} />
      <div className="flex items-center justify-end">
        <Link href="/add" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </Link>
      </div>
      <DataTable columns={columns({ deleteItem, userRole: 'admin' })} data={items} />
    </div>
  );
}
