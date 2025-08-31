import AppLayout from "@/components/AppLayout";
import ItemClientPage from "@/components/pages/item/ItemClientPage";

function isValidId(id: string): boolean {
    // Only allow alphanumeric IDs, dashes, and underscores, 1-64 chars
    return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

export default function ItemPage({ params }: { params: { id: string } }) {
    if (!isValidId(params.id)) {
        // Optionally, you could use Next.js notFound() for invalid IDs
        // but to avoid breaking changes, just render nothing or an error
        return (
            <AppLayout>
                <div>Invalid item ID.</div>
            </AppLayout>
        );
    }
    return (
        <AppLayout>
            <ItemClientPage itemId={params.id} />
        </AppLayout>
    );
}
