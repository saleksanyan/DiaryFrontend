"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, User as UserIcon, Search } from 'lucide-react';
import { useState } from 'react';
import DiaryLogo from './Logo';
import { UserDropdown } from './UserDropdown';
import { useAuth } from '../context/AuthContext'; // Import the auth context

export function TopNav() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { isAuthenticated } = useAuth(); // Get authentication status

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-pink-50 border-b border-pink-200 flex items-center justify-between px-4 z-50">
      {/* Left side - Logo */}
      <div className="flex items-center">
        <DiaryLogo 
          href="/home" 
          className="relative"
          logoClassName="text-2xl md:text-3xl font-serif italic text-pink-700 hover:text-pink-600 transition-colors"
        />
      </div>

      {/* Center - Navigation */}
      <nav className="flex items-center space-x-6">
        <Link 
          href="/home" 
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-pink-700 hover:bg-pink-100 transition-colors"
          title="Home"
        >
          <Home className="w-5 h-5" />
          <span className="hidden md:inline font-serif">Home</span>
        </Link>

        <Link 
          href="/profile" 
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-pink-700 hover:bg-pink-100 transition-colors"
          title="Profile"
        >
          <UserIcon className="w-5 h-5" />
          <span className="hidden md:inline font-serif">Profile</span>
        </Link>
      </nav>

      {/* Right side - Search and User Dropdown */}
      <div className="flex items-center space-x-2">
        {/* Search */}
        <div className="flex items-center">
          {showSearch ? (
            <form onSubmit={handleSearch} className="flex items-center bg-white rounded-lg overflow-hidden shadow-sm border border-pink-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-grow px-4 py-2 text-pink-900 focus:outline-none text-sm w-40 md:w-64"
                autoFocus
              />
              <button 
                type="submit"
                className="px-3 bg-pink-600 text-white hover:bg-pink-700 h-full"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="px-2 text-pink-600 hover:text-pink-800"
              >
                ×
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg text-pink-700 hover:bg-pink-100 transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Only show UserDropdown if authenticated */}
        {isAuthenticated && <UserDropdown />}
        
        {/* Show login link if not authenticated */}
        {!isAuthenticated && (
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-pink-700 hover:bg-pink-100 transition-colors"
            title="Login"
          >
            <span className="hidden md:inline font-serif">Login</span>
            <UserIcon className="w-5 h-5" />
          </Link>
        )}
      </div>
    </header>
  );
}