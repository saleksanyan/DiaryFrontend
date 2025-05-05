'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TopNav } from '@/app/components/TopNav';
import DiaryLogo from '@/app/components/Logo';
import { CalendarDays, User, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  categories: string[];
  createdAt: string;
}

interface SearchResponse {
  posts: BlogPost[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, token } = useAuth();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const [data, setData] = useState<SearchResponse>({
    posts: [],
    total: 0,
    currentPage: 1,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSearchResults() {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!isAuthenticated) {
          throw new Error('Please login to search');
        }

        const response = await fetch(
          `http://localhost:3000/search?q=${encodeURIComponent(query)}&page=${page}&limit=9`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(response.status === 401 ? 'Session expired. Please login again.' : 'Failed to fetch results');
        }

        const result = await response.json();
        setData({
          posts: result.data.posts || [],
          total: result.data.total || 0,
          currentPage: result.data.currentPage || 1,
          totalPages: result.data.totalPages || 1
        });
      } catch (error) {
        console.error('Search error:', error);
        setError(error instanceof Error ? error.message : 'Search failed');
        setData({
          posts: [],
          total: 0,
          currentPage: 1,
          totalPages: 1
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (query) {
      fetchSearchResults();
    }
  }, [query, page, isAuthenticated, token]);

  const handlePageChange = (newPage: number) => {
    router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
  };

  return (
    <div className="min-h-screen bg-white font-serif">
      <TopNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-900 mb-4">
            Search Results for "{query}"
          </h1>
          {error ? (
            <p className="text-xl text-red-600 max-w-2xl mx-auto">{error}</p>
          ) : (
            <p className="text-xl text-pink-700 max-w-2xl mx-auto">
              {isLoading ? 'Searching...' : `Found ${data.total} ${data.total === 1 ? 'result' : 'results'}`}
            </p>
          )}
        </div>

        {error ? (
          <div className="text-center py-16 bg-pink-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-pink-100 text-red-600 mb-6">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-pink-900 mb-3">
              {error.includes('login') ? 'Authentication Required' : 'Search Error'}
            </h3>
            <p className="text-pink-600 max-w-md mx-auto mb-6">
              {error}
            </p>
            {error.includes('login') && (
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
              >
                Login to Continue
              </Link>
            )}
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-600 border-r-transparent"></div>
          </div>
        ) : data.posts.length === 0 ? (
          <div className="text-center py-16 bg-pink-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 mb-6">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-pink-900 mb-3">
              No results found
            </h3>
            <p className="text-pink-600 max-w-md mx-auto">
              Try different search terms
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {data.posts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-white rounded-xl overflow-hidden border border-pink-100 hover:shadow-lg transition-all duration-300"
                >
                  <Link href={`/post/${post.id}`}>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories?.slice(0, 2).map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-600"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-semibold text-pink-800 mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-pink-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span title={new Date(post.createdAt).toLocaleString()}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(data.currentPage - 1)}
                  disabled={data.currentPage === 1}
                  className={`px-4 py-2 rounded-lg border ${
                    data.currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  let pageNum;
                  if (data.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (data.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (data.currentPage >= data.totalPages - 2) {
                    pageNum = data.totalPages - 4 + i;
                  } else {
                    pageNum = data.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg border ${
                        data.currentPage === pageNum
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(data.currentPage + 1)}
                  disabled={data.currentPage === data.totalPages}
                  className={`px-4 py-2 rounded-lg border ${
                    data.currentPage === data.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}