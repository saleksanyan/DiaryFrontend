"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  login: (token: string, userData?: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    isAuthenticated: boolean;
    user: any;
    token: string | null;
  }>({
    isAuthenticated: false,
    user: null,
    token: null
  });
  const router = useRouter();

  const syncAuthState = () => {
    const storedToken = localStorage.getItem('tempToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setState({
        isAuthenticated: true,
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken
      });
    } else {
      setState({
        isAuthenticated: false,
        user: null,
        token: null
      });
    }
  };

  useEffect(() => {
    syncAuthState();
  }, []);

  const login = async (token: string, userData?: any) => {
    localStorage.setItem('tempToken', token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    syncAuthState();
  };

  const logout = async () => {
    try {
      const storedToken = localStorage.getItem('tempToken');

      await fetch('http://localhost:3000/user/logout', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      });
    } finally {
      localStorage.removeItem('tempToken');
      localStorage.removeItem('user');
      setState({
        isAuthenticated: false,
        user: null,
        token: null
      });
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      token: state.token,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);