
import AppLayout from "@/components/AppLayout";
import InventoryItemForm from "@/components/InventoryItemForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AddItemPage() {
    return (
        <AppLayout>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Add New Item</CardTitle>
                    <CardDescription>Fill in the details below to add a new item to your inventory.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InventoryItemForm />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
