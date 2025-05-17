'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Search, Bell, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import DiaryLogo from './Logo';
import { UserDropdown } from './UserDropdown';
import { useAuth } from '../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { WebSocketManager } from './WebSocketManager.client';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
  userId: string;
}

export function TopNav() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { isAuthenticated, user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:3000/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch notifications');

        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, token]);

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const response = await fetch(`http://localhost:3000/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to mark as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
      setUnreadCount((prev) => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    try {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      const response = await fetch('http://localhost:3000/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to mark all as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-pink-50 border-b border-pink-200 flex items-center justify-between px-4 z-50">
      {/* Left side - Logo and Search */}
      <div className="flex items-center gap-4">
        <DiaryLogo
          href="/home"
          className="relative"
          logoClassName="text-2xl md:text-3xl font-serif italic text-pink-700 hover:text-pink-600 transition-colors"
        />

        {/* WebSocket Manager (hidden) */}
        {mounted && isAuthenticated && (
          <WebSocketManager onNotification={handleNotification} onConnect={setSocket} />
        )}

        {/* Search bar positioned next to logo */}
        <div className="relative">
          {showSearch ? (
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-64 pl-4 pr-10 py-2 rounded-full border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 hover:text-pink-700"
              >
                <X className="h-5 w-5" />
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
      </div>

      {/* Right side - Navigation */}
      <div className="flex items-center space-x-2">
        {mounted && isAuthenticated && (
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-pink-700 hover:bg-pink-100 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-pink-200 z-50">
                  <div className="p-3 border-b border-pink-100 font-medium text-pink-800 flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-pink-600 hover:text-pink-800"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-pink-600">No notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-pink-100 hover:bg-pink-50 cursor-pointer ${!notification.isRead ? 'bg-pink-50' : ''}`}
                          onClick={() => {
                            if (!notification.isRead) markAsRead(notification.id);
                            router.push(notification.link);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="text-sm text-pink-800">{notification.message}</div>
                          <div className="text-xs text-pink-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <UserDropdown />
          </>
        )}

        {mounted && !isAuthenticated && (
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
