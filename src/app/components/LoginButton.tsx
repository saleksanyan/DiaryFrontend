'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginButton() {
  const { token } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 flex justify-end">
      <Link
        href="/login"
        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-serif italic"
      >
        <User className="h-4 w-4" />
        Login
      </Link>
    </div>
  );
}
