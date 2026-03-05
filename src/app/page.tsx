'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel';

export default function HomePage() {
  const { currentUser, loading } = useAuthViewModel();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (currentUser) {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/login');
    }
  }, [currentUser, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="w-8 h-8 rounded-full border-2 border-navy-800 border-t-transparent animate-spin" />
        <p className="text-sm">טוען...</p>
      </div>
    </div>
  );
}
