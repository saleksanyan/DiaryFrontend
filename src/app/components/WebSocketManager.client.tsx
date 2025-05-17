'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export function WebSocketManager({
  onNotification,
  onConnect,
}: {
  onNotification: (notification: any) => void;
  onConnect: (socket: Socket) => void;
}) {
  const { isAuthenticated, user, token } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io('http://localhost:3000', {
      path: '/notification-message',
      transports: ['websocket'],
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      if (user?.id) {
        socket.emit('joinUserRoom', user.id);
        onConnect(socket);
      }
    });

    socket.on('notification', onNotification);

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, user?.id]);

  return null;
}
