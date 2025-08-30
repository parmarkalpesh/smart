
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { InventoryItem, ItemStatus } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowUpDown, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type ColumnsProps = {
  deleteItem: (id: string) => void;
  userRole: 'admin' | 'staff' | null;
};

const getStatusBadgeVariant = (status: ItemStatus) => {
  switch (status) {
    case 'Available':
      return 'secondary';
    case 'Checked Out':
      return 'default';
    case 'In Maintenance':
      return 'destructive';
    case 'Low Stock':
      return 'outline';
    case 'Wasted':
      return 'destructive'
    default:
      return 'secondary';
  }
};


export const columns = ({ deleteItem, userRole }: ColumnsProps): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: 'imageUrl',
    header: '',
    cell: ({row}) => {
      const imageUrl = row.getValue('imageUrl') as string | undefined;
      const name = row.getValue('name') as string;
      return imageUrl ? (
        <div className="w-10 h-10 relative flex-shrink-0">
          <Image src={imageUrl} alt={name} fill className="rounded-md object-cover" />
        </div>
      ) : null
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as ItemStatus;
      return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>;
    }
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
  },
  {
    accessorKey: 'dateAdded',
    header: 'Date Added',
    cell: ({ row }) => {
      const date = new Date(row.getValue('dateAdded'));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: 'expiryDate',
    header: 'Expiry Date',
    cell: ({ row }) => {
      const date = row.getValue('expiryDate') as string | undefined;
      if (!date) return 'N/A';
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original;
      const { toast } = useToast();

      const handleDelete = () => {
        deleteItem(item.id);
        toast({
          title: "Item Deleted",
          description: `"${item.name}" has been removed from inventory.`,
        });
      };

      return (
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/item/${item.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  View/Edit Item
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {userRole === 'admin' && (
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the item
                "{item.name}" from your inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
