'use client';

import { CalendarDays, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProtectedLink } from './ProtectedLink';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  categories: string[];
  status: string;
  createdAt: string;
}

export function PostCard({ post }: { post: BlogPost }) {
  const router = useRouter();

  const handleClick = () => {
    const isAuthenticated =
      typeof window !== 'undefined' ? !!localStorage.getItem('tempToken') : false;

    if (isAuthenticated) {
      router.push(`/post/${post.id}`);
    } else {
      router.push('/login');
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg overflow-hidden border border-pink-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <ProtectedLink href={`/post/${post.id}`}>
        <div className="p-6 font-serif">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-600 font-sans"
              >
                {cat}
              </span>
            ))}
          </div>
          <h4 className="text-xl font-semibold text-pink-800 mb-3 line-clamp-2 italic">
            {post.title}
          </h4>
          <div className="flex items-center justify-between text-sm text-pink-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-serif">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="font-serif">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </ProtectedLink>
    </div>
  );
}
