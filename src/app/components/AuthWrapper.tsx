'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from './TopNav';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tempToken') : null;

    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex">
      {isAuthenticated && <TopNav />}
      <div className={`flex-1 ${isAuthenticated ? 'pl-16 md:pl-20' : ''}`}>{children}</div>
    </div>
  );
}
