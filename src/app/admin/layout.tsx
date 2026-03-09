'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/admin/dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
  { href: '/admin/guests',    label: 'אורחים',   icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, logout } = useAuthViewModel();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f0fafa] to-white">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-[#6b7280]">טוען...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fafa] to-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold" style={{ color: '#1e3a5f' }}>
              ניהול אורחים 💍
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg',
                    isActive
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/60',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-2 h-0.5 rounded-full bg-teal-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            יציאה
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
