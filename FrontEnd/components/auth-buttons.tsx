'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { UserNav } from './user-nav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthButtons() {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
    const storedToken = localStorage.getItem('auth-token');
      
      // If we have a stored token but no token in state, try to restore it
      if (storedToken && !token) {
        // Don't redirect immediately, let the auth state settle
        console.log('Found stored token, checking authentication...');
    }
      
      setIsCheckingAuth(false);
    };

    // Small delay to let the auth state initialize
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [token]);

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <UserNav />;
  }

  return (
    <div className="flex items-center space-x-4">
      <Button asChild variant="outline" className="font-semibold">
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild className="font-semibold">
        <Link href="/register">Join Free</Link>
      </Button>
    </div>
  );
}
