"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, LogOut, User as UserIcon, Settings, Link } from 'lucide-react';

export function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-50"
      >
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-pink-600" />
        </div>
        <span className="font-medium text-pink-900">{user?.name || "Account"}</span>
        <ChevronDown className={`w-4 h-4 text-pink-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-pink-100 py-1 z-50">
          <Link 
            href="/profile" 
            className="flex items-center px-4 py-2 text-sm hover:bg-pink-50"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4 mr-2 text-pink-500" />
            My Profile
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-pink-50 text-pink-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
}