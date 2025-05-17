'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOOD_COLORS } from '../components/UserProfile';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  categories: string[];
  status: string;
  createdAt: string;
  mood: string;
}

interface MoreFromAuthorProps {
  author: string;
  currentPostId: string;
}

export function MoreFromAuthor({ author, currentPostId }: MoreFromAuthorProps) {
  const { token } = useAuth();
  const [userPosts, setUserPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUserPosts = async () => {
      try {
        const res = await fetch(`http://localhost:3000/post/user/${author}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (!res.ok) {
          console.error('Failed to fetch posts:', res.status, res.statusText);
          return;
        }

        const data = await res.json();
        setUserPosts(data.posts?.filter((post: BlogPost) => post.id !== currentPostId) || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [token, author, currentPostId]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="bg-pink-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-pink-900 mb-16 text-center">
          More from <span className="italic">{author}</span>
        </h2>

        {userPosts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {userPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-pink-100 hover:border-pink-200"
              >
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-5">
                    {post.categories.slice(0, 2).map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-600"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold text-pink-900 mb-4 line-clamp-2 group-hover:text-pink-700 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-pink-600">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                      <CalendarDays className="h-3 w-3" />
                    </div>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.mood && (
                      <>
                        <span className="mx-1">•</span>
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-pink-100 max-w-2xl mx-auto">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 mb-6">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-pink-900 mb-3">
              {token ? 'No other posts yet' : 'Sign in to see more posts'}
            </h3>
            <p className="text-pink-600 max-w-md mx-auto">
              {token
                ? `${author} hasn't published any other articles yet.`
                : 'Sign in to view all articles by this author.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
