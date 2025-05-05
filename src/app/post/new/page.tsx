'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DiaryLogo from '@/app/components/Logo';
import { TextEditor } from '@/app/components/TextEditor';

const MOOD_OPTIONS = [
  { value: 'happy', label: '😊 Happy', color: 'bg-green-100 text-green-800' },
  { value: 'sad', label: '😢 Sad', color: 'bg-blue-100 text-blue-800' },
  { value: 'excited', label: '🤩 Excited', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'angry', label: '😠 Angry', color: 'bg-red-100 text-red-800' },
  { value: 'neutral', label: '😐 Neutral', color: 'bg-gray-100 text-gray-800' },
  { value: 'creative', label: '🎨 Creative', color: 'bg-purple-100 text-purple-800' },
];

interface Category {
  id: string;
  name: string;
}

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p>Start writing your post here...</p>');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mood, setMood] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/category/list');

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();

        const categoriesArray = Array.isArray(data) 
          ? data 
          : data.categories || [];

        setCategories(categoriesArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(name => name !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
console.log("JSON ", {
    title,
    content,
    categories: selectedCategories,
    mood
  });

    try {
      const token = localStorage.getItem('tempToken');
      const response = await fetch('http://localhost:3000/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          categories: selectedCategories,
          mood
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();
      router.push(`/post/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute top-8 left-8 z-10">
        <DiaryLogo logoClassName="text-3xl font-serif italic text-gray-900 hover:text-gray-900 transition-colors"/>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Create New Entry</h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition"
                  placeholder="Entry title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <TextEditor 
                  content={content}
                  onChange={setContent}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories (Select multiple)
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.name)}
                            onChange={() => handleCategoryChange(category.name)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
                            {category.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No categories available</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {MOOD_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMood(option.value)}
                        className={`px-3 py-2 rounded-lg text-center border transition ${
                          mood === option.value 
                            ? 'border-pink-300 ring-2 ring-pink-200' 
                            : 'border-gray-200 hover:border-pink-200'
                        } ${option.color}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedCategories.length === 0}
                  className={`px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors ${
                    isSubmitting || selectedCategories.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publishing...
                    </>
                  ) : 'Publish Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}