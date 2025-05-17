'use client';

import Link from 'next/link';
import { CalendarDays, User, Lock, Globe } from 'lucide-react';
import { TopNav } from '@/app/components/TopNav';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useSearchParams, useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { MOOD_COLORS } from '@/app/components/UserProfile';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  categories: string[];
  createdAt: string;
  mood: string;
  mode: string;
}

interface BlogPostsWithCount {
  posts: BlogPost[];
  total: number;
}

export default function UserPostsPage() {
  const { token } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();

  const username = decodeURIComponent(params.username as string);
  const sort = searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';

  const [postsData, setPostsData] = useState<BlogPostsWithCount>({ posts: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const getUserPosts = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/post/user/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await res.json();

        data.posts.sort((a: BlogPost, b: BlogPost) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sort === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setPostsData(data);
      } catch (error) {
        console.error('Error fetching user posts:', error);
        setError(error instanceof Error ? error.message : 'Failed to load posts');
        setPostsData({ posts: [], total: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getUserPosts();
    }
  }, [username, sort, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-serif">
        <TopNav />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white font-serif">
        <TopNav />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-pink-200 mx-auto">
            <h2 className="text-2xl font-serif text-pink-900 mb-4">Error Loading Posts</h2>
            <p className="text-pink-700 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { posts, total } = postsData;

  return (
    <div className="min-h-screen bg-white font-serif">
      <TopNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-900 mb-4">{username}'s Diary Entries</h1>
          <p className="text-pink-600">
            {total} {total === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex justify-end mb-8 gap-2">
          <Link
            href={`/posts/${username}?sort=newest`}
            className={`px-4 py-2 rounded-lg border ${
              sort === 'newest'
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
            }`}
          >
            Newest
          </Link>
          <Link
            href={`/posts/${username}?sort=oldest`}
            className={`px-4 py-2 rounded-lg border ${
              sort === 'oldest'
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
            }`}
          >
            Oldest
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-pink-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 mb-6">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-pink-900 mb-3">No posts found</h3>
            <p className="text-pink-600 max-w-md mx-auto">
              {username} hasn't created any posts yet
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`bg-white rounded-xl overflow-hidden border ${
                  post.mode === 'public' ? 'border-pink-100' : 'border-pink-300 border-2'
                } hover:shadow-lg transition-all duration-300`}
              >
                <Link href={`/post/${post.id}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-2">
                        {post.categories.slice(0, 2).map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-600"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        {post.mode === 'private' ? (
                          <>
                            <Lock className="h-4 w-4 text-pink-600" />
                            <span className="text-xs text-pink-600">Private</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 text-pink-600" />
                            <span className="text-xs text-pink-600">Public</span>
                          </>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-pink-800 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-pink-600">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span title={new Date(post.createdAt).toLocaleString()}>
                          {new Date(post.createdAt).toLocaleDateString()}
                          {post.mood && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="flex items-center">
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-1"
                                  style={{
                                    backgroundColor:
                                      MOOD_COLORS[post.mood.toLowerCase()] || MOOD_COLORS.neutral,
                                  }}
                                ></span>
                                {post.mood}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
