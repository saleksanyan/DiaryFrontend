'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TextEditor } from '@/app/components/TextEditor';
import { TopNav } from '@/app/components/TopNav';
import { useAuth } from '@/app/context/AuthContext';

interface Category {
  id: string;
  name: string;
}

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mood, setMood] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { token } = useAuth();
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/category/list?page=1&limit=3', {
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : data.categories || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('tempToken');
      const visibility = isPublic ? 'public' : 'private';

      const response = await fetch('http://localhost:3000/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          categories: selectedCategories,
          visibility,
        }),
      });

      if (!response.ok) throw new Error('Failed to create post');
      const data = await response.json();
      router.push(`/post/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <TopNav />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-200">
          {/* Card Header */}
          <div className="px-8 py-6 border-b border-pink-200 bg-pink-100">
            <h1 className="text-2xl font-serif font-bold text-pink-900">Create New Entry</h1>
          </div>

          {/* Card Body */}
          <div className="px-8 py-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-pink-900 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition text-black"
                  placeholder="What's on your mind?"
                  required
                />
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-pink-900 mb-1">Content</label>
                <TextEditor
                  content={content}
                  onChange={setContent}
                  className="border border-pink-200 rounded-lg"
                  placeholder="Pour your thoughts here... (Start typing or use AI to enhance)"
                />
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-3 border border-pink-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-pink-900 mb-1">Visibility</label>
                  <p className="text-xs text-pink-500">
                    {isPublic
                      ? 'This post will be visible to everyone'
                      : 'This post will be private to only you'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 ${
                    isPublic ? 'bg-pink-600' : 'bg-pink-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Categories and Mood */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-pink-900 mb-1">Categories</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-pink-200 rounded-lg">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.name)}
                            onChange={() => handleCategoryChange(category.name)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-300 border-pink-200 rounded"
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="ml-2 text-sm text-pink-900"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-pink-500">No categories available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-pink-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-pink-200 rounded-lg text-pink-700 hover:bg-pink-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedCategories.length === 0}
                  className={`px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 transition ${
                    isSubmitting || selectedCategories.length === 0
                      ? 'opacity-70 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    'Publish Entry'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
