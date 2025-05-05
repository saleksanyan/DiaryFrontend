'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DiaryLogo from '@/app/components/Logo';
import { TextEditor } from '@/app/components/TextEditor';
import { useAuth } from '@/app/context/AuthContext';

interface Category {
  id: string;
  name: string;
}

interface PostData {
  title: string;
  content: string;
  mood?: string;
  categoryId: string;
}

interface Comment {
  id: string;
  comment: string;
  author: string;
  authorId: string;
  createdAt: string;
  isAuthor: boolean;
}

export default function EditPost() {
  const [post, setPost] = useState<PostData>({
    title: '',
    content: '',
    mood: '',
    categoryId: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');
  const router = useRouter();
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();

  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    if (token) {
      const userData = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(userData.userId);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {        
        const [postResponse, categoriesResponse] = await Promise.all([
          fetch(`http://localhost:3000/post/${id}`, {
            method: 'GET',
           }),
          fetch('http://localhost:3000/category/list')
        ]);
  
        if (!postResponse.ok || !categoriesResponse.ok) {
          throw new Error('Failed to fetch data');
        }
  
        const [postData, categoriesData] = await Promise.all([
          postResponse.json(),
          categoriesResponse.json()
        ]);
  
        // Ensure categoriesData is an array
        const categoriesArray = Array.isArray(categoriesData) 
          ? categoriesData 
          : categoriesData.data || categoriesData.categories || [];
  
        setPost({
          title: postData.title,
          content: postData.content,
          mood: postData.mood || '',
          categoryId: postData.categoryId || ''
        });
        setCategories(categoriesArray);
        
        // Fetch comments after post data is loaded
        await fetchComments();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('tempToken');
      if (!token) {
        setCommentError('Please login to view comments');
        return;
      }

      const response = await fetch(`http://localhost:3000/comment/list/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();
      setComments(data.map((comment: any) => ({
        ...comment,
        isAuthor: comment.authorId === currentUserId
      })));
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const token = localStorage.getItem('tempToken');
      if (!token) {
        setCommentError('Please login to comment');
        return;
      }

      const response = await fetch('http://localhost:3000/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comment: newComment,
          postId: id
        })
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      setNewComment('');
      await fetchComments(); // Refresh comments
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem('tempToken');
      const response = await fetch(`http://localhost:3000/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete comment');
      
      await fetchComments(); // Refresh comments
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('tempToken');
      const response = await fetch(`http://localhost:3000/post/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          categoryId: post.categoryId,
          mood: post.mood
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setPost(prev => ({ ...prev, content }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="absolute top-8 left-8 z-10">
        <DiaryLogo logoClassName="text-3xl font-serif italic text-pink-900 hover:text-pink-900 transition-colors"/>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100 p-8">
          <h2 className="text-2xl font-serif text-pink-900 mb-6">Edit Diary Entry</h2>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-pink-900 mb-1">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={post.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition text-black"
                placeholder="Entry title"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-pink-900 mb-1">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={post.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition text-black"
                required
                disabled={categories.length === 0}
              >
                <option value="">Select a category</option>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No categories available</option>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="mood" className="block text-sm font-medium text-pink-900 mb-1">
                Mood (Optional)
              </label>
              <select
                id="mood"
                name="mood"
                value={post.mood}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition text-black"
              >
                <option value="">No mood selected</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="excited">Excited</option>
                <option value="calm">Calm</option>
                <option value="angry">Angry</option>
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-pink-900 mb-1">
                Content
              </label>
              <TextEditor
                content={post.content}
                onChange={handleContentChange}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-pink-300 text-sm font-medium rounded-lg text-pink-700 bg-white hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 font-medium"
              >
                Update Entry
              </button>
            </div>
          </form>

          {/* Comments Section */}
          <div className="mt-12 pt-8 border-t border-pink-200">
            <h3 className="text-xl font-serif text-pink-900 mb-4">Comments</h3>
            
            {commentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {commentError}
              </div>
            )}

            {/* Add comment form */}
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow px-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none transition"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-pink-300 transition-colors"
              >
                Post
              </button>
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-pink-600">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-pink-900">{comment.author}</p>
                        <p className="text-sm text-pink-600 mb-2">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                        <p className="text-pink-800">{comment.comment}</p>
                      </div>
                      {comment.isAuthor && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-pink-600 hover:text-pink-800 text-sm"
                          title="Delete comment"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}