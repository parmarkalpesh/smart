
'use client';

import { useInventory } from '@/hooks/useInventory';
import { notFound } from 'next/navigation';
import InventoryItemForm from '@/components/InventoryItemForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QRCodeComponent from '@/components/QRCodeComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import {ImageIcon, Fingerprint, MapPin, Building, Calendar} from 'lucide-react';

export default function ItemClientPage({ itemId }: { itemId: string }) {
  const { getItemById } = useInventory();
  const [item, setItem] = useState<InventoryItem | undefined | null>(undefined);

  useEffect(() => {
    const foundItem = getItemById(itemId);
    setItem(foundItem);
  }, [itemId, getItemById]);


  if (item === undefined) {
    return <ItemSkeleton />;
  }

  if (!item) {
    notFound();
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Edit Item</CardTitle>
                <CardDescription>Update the details of "{item.name}".</CardDescription>
                </CardHeader>
                <CardContent>
                    <InventoryItemForm item={item} />
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
             {item.imageUrl ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Item Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video relative">
                            <Image src={item.imageUrl} alt={item.name} fill className="rounded-md object-cover" />
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Item Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video flex items-center justify-center bg-muted rounded-md">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Item QR Code</CardTitle>
                    <CardDescription>Scan this code to view or update item status quickly.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <QRCodeComponent item={item} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-start justify-between">
                        <div className='flex items-center gap-2'>
                           <Fingerprint className="h-4 w-4 text-muted-foreground" />
                           <span className="text-muted-foreground">ID</span>
                        </div>
                        <span className="font-mono bg-muted px-2 py-1 rounded-md text-xs">{item.id}</span>
                    </div>
                    <Separator />
                    {item.location && (
                        <>
                        <div className="flex items-center justify-between">
                            <div className='flex items-center gap-2'>
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Location</span>
                            </div>
                            <span className='font-medium'>{item.location}</span>
                        </div>
                        <Separator />
                        </>
                    )}
                    {item.supplier && (
                        <>
                        <div className="flex items-center justify-between">
                             <div className='flex items-center gap-2'>
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Supplier</span>
                            </div>
                            <span className='font-medium'>{item.supplier}</span>
                        </div>
                        <Separator />
                        </>
                    )}
                    <div className="flex items-center justify-between">
                         <div className='flex items-center gap-2'>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Date Added</span>
                        </div>
                        <span className='font-medium'>{new Date(item.dateAdded).toLocaleDateString()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

function ItemSkeleton() {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="flex justify-end"><Skeleton className="h-10 w-24" /></div>
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                     <CardContent>
                        <Skeleton className="w-full aspect-video" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-6">
                        <Skeleton className="h-40 w-40" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
