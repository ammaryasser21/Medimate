'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    // Initialize auth state when the component mounts
    const initAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };
    
    initAuth();
  }, [initializeAuth]);

  return <>{children}</>;
} 