'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, User, Search } from 'lucide-react';
import DiaryLogo from '@/app/components/Logo';
import { useAuth } from '@/app/context/AuthContext';
import { TopNav } from '@/app/components/TopNav';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  categories: string[];
  createdAt: string;
  mood?: string;
}

export default function CategoryPostsClient({
  initialPosts,
  initialTotal,
  id,
  sort,
}: {
  initialPosts: BlogPost[];
  initialTotal: number;
  id: string;
  sort: 'newest' | 'oldest';
}) {
  const { isAuthenticated, logout } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchCategoryAndPosts() {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('tempToken');
        
        // First fetch the category name
        const categoryRes = await fetch(`http://localhost:3000/category/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!categoryRes.ok) {
          console.error('Failed to fetch category');
          return;
        }
        
        const category = await categoryRes.json();
        setCategoryName(category.name);
        const cleanedCategoryName = encodeURIComponent(category.name.replaceAll(' ', '-'));

        // Then fetch the posts for this category with sorting
        const response = await fetch(
          `http://localhost:3000/post/category/${cleanedCategoryName}?sort=${sort}`, // Add sort parameter
          {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
          setTotal(data.total);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategoryAndPosts();
  }, [id, sort, isAuthenticated]); // sort is now properly used in the dependency array

  // Apply client-side sorting as fallback (optional)
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sort === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const filteredPosts = sortedPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white font-serif">
      <TopNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-900 mb-4">
            Posts in <span className="capitalize">"{categoryName || '...'}"</span>
          </h1>
          <p className="text-xl text-pink-700 max-w-2xl mx-auto">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none transition"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/category/${id}?sort=newest`}
              className={`px-4 py-2 rounded-lg border ${
                sort === 'newest' 
                  ? 'bg-pink-600 text-white border-pink-600' 
                  : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
              }`}
            >
              Newest
            </Link>
            <Link
              href={`/category/${id}?sort=oldest`}
              className={`px-4 py-2 rounded-lg border ${
                sort === 'oldest' 
                  ? 'bg-pink-600 text-white border-pink-600' 
                  : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
              }`}
            >
              Oldest
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-600 border-r-transparent"></div>
            <p className="mt-4 text-pink-700">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-pink-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 mb-6">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-pink-900 mb-3">
              No posts found
            </h3>
            <p className="text-pink-600 max-w-md mx-auto">
              {searchQuery
                ? 'Try a different search term'
                : 'No posts have been created in this category yet'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-xl overflow-hidden border border-pink-100 hover:shadow-lg transition-all duration-300"
              >
                <Link href={`/post/${post.id}`}>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories.slice(0, 2).map((category, index) => (
                        <Link 
                          key={index}
                          href={`/category/${encodeURIComponent(category)}`}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-600 hover:bg-pink-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {category}
                        </Link>
                      ))}
                      {post.categories.length > 2 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-600">
                          +{post.categories.length - 2}
                        </span>
                      )}
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
        )}
      </div>
    </div>
  );
}