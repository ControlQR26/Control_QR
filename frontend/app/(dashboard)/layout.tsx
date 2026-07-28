"use client";

import { SessionProvider } from 'next-auth/react';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Omitir layout en login
  if (pathname === '/login') {
    return (
      <SessionProvider>
        {children}
        <Toaster position="top-right" richColors />
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar para pantallas grandes y Drawer para móviles */}
        <Sidebar currentPath={pathname} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        
        <div className="flex flex-col flex-1 overflow-hidden w-full">
          <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </SessionProvider>
  );
}
