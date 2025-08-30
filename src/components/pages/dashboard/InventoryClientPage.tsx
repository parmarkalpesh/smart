'use client';

import { useInventory } from '@/hooks/useInventory';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function InventoryClientPage() {
  const { items, deleteItem } = useInventory();
  const { userRole } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Link href="/add" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </Link>
      </div>
      <DataTable columns={columns({ deleteItem, userRole })} data={items} />
    </div>
  );
}
