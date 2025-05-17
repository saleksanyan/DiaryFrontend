'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LikeButton({
  id,
  initialLikes = 0,
  initialIsLiked = false,
}: {
  id: string;
  initialLikes?: number;
  initialIsLiked?: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  // Sync with server data when props change
  useEffect(() => {
    setLikes(initialLikes);
    setIsLiked(initialIsLiked);
  }, [initialLikes, initialIsLiked]);

  const handleLike = async () => {
    if (!token) {
      alert('Please login to like posts');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isLiked
        ? `http://localhost:3000/post/remove-like/${id}`
        : `http://localhost:3000/post/add-like/${id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes ?? likes);
        setIsLiked(!isLiked);
      } else {
        throw new Error('Failed to update like status');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLiked((prev) => !prev);
      setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1 ${
        isLiked ? 'text-pink-700' : 'text-pink-500 hover:text-pink-700'
      } transition-colors ${isLoading ? 'opacity-50' : ''}`}
      aria-label={isLiked ? 'Unlike post' : 'Like post'}
    >
      <Heart className={`h-5 w-5 ${isLiked ? 'fill-pink-600' : 'fill-none'}`} />
      <span>{likes}</span>
    </button>
  );
}
