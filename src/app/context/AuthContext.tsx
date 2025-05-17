'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, userData?: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [state, setState] = useState<{
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  }>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tempToken');
      const user = localStorage.getItem('user');
      return {
        isAuthenticated: !!token,
        user: user ? JSON.parse(user) : null,
        token: token,
      };
    }
    return { isAuthenticated: false, user: null, token: null };
  });

  const login = async (token: string, userData?: User) => {
    localStorage.setItem('tempToken', token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setState({
      isAuthenticated: true,
      user: userData || null,
      token: token,
    });
  };

  const logout = async () => {
    try {
      if (state.token) {
        await fetch('http://localhost:3000/user/logout', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.token}`,
          },
        });
      }
    } finally {
      localStorage.removeItem('tempToken');
      localStorage.removeItem('user');
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
      router.push('/login');
    }
  };

  // Add this useEffect to handle potential token changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tempToken' || e.key === 'user') {
        const token = localStorage.getItem('tempToken');
        const user = localStorage.getItem('user');
        setState({
          isAuthenticated: !!token,
          user: user ? JSON.parse(user) : null,
          token: token,
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
