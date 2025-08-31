'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, User } from 'lucide-react';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // Only allow login as 'staff' to prevent client-side privilege escalation
  const handleLogin = () => {
    login('staff');
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary text-primary-foreground">
              <QrCode className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Ace</h1>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Log in to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full"
            variant="secondary"
          >
            <User className="mr-2 h-4 w-4" />
            Log in as Staff