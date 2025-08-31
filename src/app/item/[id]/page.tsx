
import AppLayout from "@/components/AppLayout";
import ItemClientPage from "@/components/pages/item/ItemClientPage";

export default function ItemPage({ params }: { params: { id: string } }) {
    return (
        <AppLayout>
            <ItemClientPage itemId={params.id} />
        </AppLayout>
    );
}
