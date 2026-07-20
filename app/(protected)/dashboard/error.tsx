'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/features/shared/ui/Button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream/30">
      <div className="max-w-md p-8 bg-white border border-brand-stone-soft rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-serif font-semibold text-brand-charcoal mb-4">
          Access Denied
        </h2>
        <p className="text-sm text-brand-charcoal-muted mb-6">
          {error.message || "You don't have permission to access this area."}
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => router.push('/dashboard')}>
            Go to My Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
