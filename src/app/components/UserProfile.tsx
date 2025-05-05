"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TopNav } from './TopNav';
import { useAuth } from '../context/AuthContext';

interface BlogPost {
  id: string;
  title: string;
  createdAt: string;
  mood?: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  status: string;
  posts: BlogPost[];
}

const MOOD_COLORS: Record<string, string> = {
  happy: '#f472b6',
  sad: '#60a5fa',
  excited: '#f59e0b',
  calm: '#10b981',
  angry: '#ef4444',
  default: '#a78bfa'
};

export function UserDashboard() {
  const { token } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
              const userResponse = await fetch('http://localhost:3000/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to load user data');
        }

        const data: UserData = await userResponse.json();
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        localStorage.removeItem('tempToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  const navigateToPost = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const navigateToNewPost = () => {
    router.push('/post/new');
  };

  // Process data for charts
  const processPostData = () => {
    if (!userData) return { weeklyData: [], moodData: [] };
  
    // Initialize daily count for last 7 days
    const weeklyCount: Record<string, number> = {};
    const moodCount: Record<string, number> = {};
    const today = new Date();
    
    // Initialize all dates in the last 7 days with 0 posts
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      weeklyCount[dateString] = 0;
    }
  
    // Count actual posts
    userData.posts.forEach(post => {
      const postDate = new Date(post.createdAt);
      const dateString = postDate.toISOString().split('T')[0];
      
      // Only count if within last 7 days
      if (weeklyCount.hasOwnProperty(dateString)) {
        weeklyCount[dateString]++;
      }
      
      // Count by mood
      const mood = post.mood || 'default';
      moodCount[mood] = (moodCount[mood] || 0) + 1;
    });
  
    // Format for BarChart
    const weeklyData = Object.entries(weeklyCount)
      .map(([date, count]) => ({
        name: date,
        posts: count,
        fullDate: new Date(date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        })
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  
    // Format for PieChart
    const moodData = Object.entries(moodCount).map(([name, value]) => ({
      name,
      value,
      color: MOOD_COLORS[name.toLowerCase()] || MOOD_COLORS.default
    }));
  
    return { weeklyData, moodData };
  };
  
  const navigateToEditPost = (postId: string) => {
    router.push(`/post/edit/${postId}`);
  };

  const { weeklyData, moodData } = processPostData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-pink-100">
          <h2 className="text-2xl font-serif text-pink-900 mb-4">Error Loading Dashboard</h2>
          <p className="text-pink-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
<div className="min-h-screen bg-white font-sans">
    <TopNav />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-pink-100">
          <div className="px-8 py-6 border-b border-pink-200 bg-pink-50">
            <h2 className="text-2xl font-serif text-pink-900">Welcome back, {userData.username}</h2>
          </div>
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-pink-600 uppercase tracking-wider">Username</h3>
                  <p className="mt-1 text-lg text-pink-900 font-medium">{userData.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-pink-600 uppercase tracking-wider">Total Entries</h3>
                  <p className="mt-1 text-lg text-pink-900 font-medium">{userData.posts.length}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-pink-600 uppercase tracking-wider">Email</h3>
                  <p className="mt-1 text-lg text-pink-900 font-medium">{userData.email}</p>
                </div>
                <div>
                  <button
                    onClick={navigateToNewPost}
                    className="mt-4 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 font-medium"
                  >
                    Create New Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Activity Chart */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100 p-6">
  <h3 className="text-xl font-serif text-pink-900 mb-6">Daily Activity (Last 7 Days)</h3>
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={weeklyData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" />
        <XAxis 
          dataKey="name" 
          stroke="#9d174d" 
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { weekday: 'short' }); // Show weekday abbreviation
          }}
        />
        <YAxis stroke="#9d174d" />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            borderColor: '#fbcfe8',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value, name, props) => [
            value,
            name,
            new Date(props.payload.name).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })
          ]}
          labelFormatter={() => ''}
        />
        <Bar dataKey="posts" fill="#ec4899" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

          {/* Mood Distribution Chart */}
<div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100 p-6">
  <h3 className="text-xl font-serif text-pink-900 mb-6">Mood Distribution</h3>
  <div className="h-64">
    {moodData.length > 0 && moodData.some(mood => mood.name !== 'default') ? (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={moodData.filter(mood => mood.name !== 'default')}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {moodData.filter(mood => mood.name !== 'default').map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              borderColor: '#fbcfe8',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-full flex flex-col items-center justify-center text-pink-400 p-4 text-center">
        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No mood data available</p>
        <p className="text-sm mt-2 text-pink-300">Add mood tags to your entries to see distribution</p>
      </div>
    )}
  </div>
</div>
        </div>

        {/* Recent Entries Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100">
          <div className="px-8 py-6 border-b border-pink-200 bg-pink-50 flex justify-between items-center">
            <h2 className="text-2xl font-serif text-pink-900">Your Diary Entries</h2>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
              {userData.posts.length} {userData.posts.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          
          {userData.posts.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <svg
                className="mx-auto h-16 w-16 text-pink-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-serif text-pink-900">No entries yet</h3>
              <p className="mt-2 text-pink-600">Begin your diary journey by creating your first entry</p>
              <div className="mt-8">
                <button
                  onClick={navigateToNewPost}
                  className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  New Entry
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-pink-100">
              {userData.posts.slice(0, 5).map((post) => (
                <li key={post.id} className="hover:bg-pink-50 transition-colors">
                  <div className="px-8 py-6 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-serif text-pink-900 truncate">
                        {post.title}
                      </p>
                      <div className="mt-1 flex items-center text-sm text-pink-500">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.mood && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                              <span 
                                className="inline-block w-3 h-3 rounded-full mr-1" 
                                style={{ backgroundColor: MOOD_COLORS[post.mood.toLowerCase()] || MOOD_COLORS.default }}
                              ></span>
                              {post.mood}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => navigateToPost(post.id)}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300"
                      >
                        Read
                      </button>
                      <button
                        onClick={() => navigateToEditPost(post.id)}
                        className="px-4 py-2 border border-pink-300 text-sm font-medium rounded-lg text-pink-700 bg-white hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {userData.posts.length > 5 && (
                <li className="px-8 py-4 text-center">
                  <button
                    onClick={() => router.push(`posts/${userData.username}`)}
                    className="text-pink-600 hover:text-pink-800 font-medium"
                  >
                    View all entries →
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}