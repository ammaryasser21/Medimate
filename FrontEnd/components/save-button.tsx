'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { AlertService } from '@/lib/alerts';

interface SaveButtonProps {
  onSave: () => Promise<boolean>;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

export function SaveButton({ 
  onSave, 
  disabled = false, 
  className,
  size = 'sm',
  variant = 'outline'
}: SaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { isAuthenticated, user, getUserId } = useAuth();

  const handleSave = async () => {
    if (isSaving || disabled) return;

    // Check authentication before saving
    if (!isAuthenticated) {
      AlertService.error('Please log in to save items to your history');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      AlertService.error('User ID not found. Please log in again to use save features');
      return;
    }

    if (!user?.email) {
      AlertService.error('User profile not found. Please log in again to use save features');
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave();
      if (success) {
        setIsSaved(true);
        // Reset saved state after 2 seconds
        setTimeout(() => setIsSaved(false), 2000);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={disabled || isSaving}
      size={size}
      variant={variant}
      className={cn(
        'transition-all duration-200',
        isSaved && 'bg-green-500 hover:bg-green-600 text-white',
        className
      )}
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSaved ? (
        <Check className="h-4 w-4" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      <span className="ml-2">
        {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save'}
      </span>
    </Button>
  );
} 