'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Comment {
  id: string;
  comment: string;
  author: string;
  authorName: string;
  createdAt: string;
  isAuthor: boolean;
  isPostAuthor?: boolean;
}

export function Comments({ postId, postAuthorName }: { postId: string; postAuthorName: string }) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  useEffect(() => {
    fetchComments();
  }, [postId, currentUsername]); // Run when postId or currentUsername changes

  const fetchUser = async () => {
    try {
      if (!token) return; // Guard clause
      
      const userResponse = await fetch('http://localhost:3000/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      
      const data = await userResponse.json();
      setCurrentUsername(data.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    }
  };

  const fetchComments = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Only add auth header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3000/comment/list/${postId}`, {
        method: "GET",
        headers
      });

      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();

      setComments(data.comments.map((comment: any) => ({
        ...comment,
        isAuthor: comment.authorName === currentUsername,
        isPostAuthor: currentUsername === postAuthorName
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      if (!token) {
        setError('Please login to comment');
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
          postId
        })
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      
      setNewComment('');
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete comment');
      
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  return (
    <div className="mt-16 max-w-2xl mx-auto px-4">
      <h3 className="text-2xl font-bold text-pink-900 mb-6">Comments</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Comments list - moved to top */}
      <div className="space-y-4 mb-8">
        {comments.length === 0 ? (
          <p className="text-pink-600">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-pink-50 rounded-lg p-4 border border-pink-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-pink-600" />
                    <p className="font-medium text-pink-900">{comment.author}</p>
                    {comment.author === postAuthorName && (
                      <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                        Author
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-pink-600 mb-2">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                  <p className="text-pink-800">{comment.comment}</p>
                </div>
                {(comment.isAuthor || comment.isPostAuthor) && (
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

      {/* Add comment form - moved to bottom */}
      <div className="flex gap-2">
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
    </div>
  );
}