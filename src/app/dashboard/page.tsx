import Link from 'next/link';

export default function DashboardRedirectPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">This page has moved.</p>
        <Link href="/" className="text-primary hover:underline">Go to Dashboard</Link>
    </div>
  );
}
