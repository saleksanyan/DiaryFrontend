'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface ProtectedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

export function ProtectedLink({ href, children, className, ...props }: ProtectedLinkProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
