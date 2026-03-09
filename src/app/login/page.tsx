'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const { login, loading, error, currentUser } = useAuthViewModel();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect to dashboard once authenticated
  useEffect(() => {
    if (currentUser) {
      router.replace('/admin/dashboard');
    }
  }, [currentUser, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
    // Redirect happens via the useEffect above when currentUser updates
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #f0fafa 0%, #ccfbf1 40%, #ffffff 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="text-5xl mb-4">💍</div>
          <h1 className="font-serif text-4xl font-bold" style={{ color: '#1e3a5f' }}>ניהול אורחים</h1>
          <p className="mt-2 text-gray-500">מערכת לניהול הזמנות לחתונה</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl bg-white p-8"
          style={{ boxShadow: '0 8px 40px rgba(13,148,136,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <h2 className="mb-6 text-xl font-semibold" style={{ color: '#1e3a5f' }}>כניסה למערכת</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="אימייל"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="סיסמה"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" loading={loading} className="mt-2 w-full" size="lg">
              כניסה
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
