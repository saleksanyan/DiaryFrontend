'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadarChart,
  Radar,
} from 'recharts';
import { TopNav } from './TopNav';
import { useAuth } from '../context/AuthContext';
import { Globe, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  createdAt: string;
  mood: string;
  mode: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  status: string;
  posts: BlogPost[];
}

export const MOOD_COLORS: Record<string, string> = {
  happy: '#f472b6',
  sad: '#60a5fa',
  excited: '#f59e0b',
  calm: '#10b981',
  angry: '#ef4444',
  neutral: '#a78bfa',
};

const MoodCalendar = ({ posts }: { posts: BlogPost[] }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const calendarData = posts.reduce(
    (acc, post) => {
      const date = new Date(post.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, total: 0, moods: {} };
      }
      acc[date].total++;
      const mood = post.mood || 'neutral';
      acc[date].moods[mood] = (acc[date].moods[mood] || 0) + 1;
      return acc;
    },
    {} as Record<string, { date: string; total: number; moods: Record<string, number> }>,
  );

  // Get most frequent mood per day
  const processedData = Object.values(calendarData).map((day) => ({
    date: day.date,
    count: day.total,
    dominantMood: Object.entries(day.moods).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral',
  }));

  return (
    <div className="bg-white rounded-xl p-6 border border-pink-100 shadow-sm relative">
      <h3 className="text-xl font-serif text-pink-900 mb-6">Mood Calendar</h3>

      {/* Date details popup */}
      <AnimatePresence>
        {(selectedDate || hoveredDate) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bg-white p-4 rounded-lg shadow-lg z-10 border border-pink-200"
            style={{
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {(() => {
              const date = selectedDate || hoveredDate;
              const dayData = processedData.find((d) => d.date === date);
              return dayData ? (
                <>
                  <p className="font-medium">
                    {new Date(date!).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p>{dayData.count} post(s)</p>
                  <p className="flex items-center">
                    Dominant mood:
                    <span
                      className="inline-block w-3 h-3 rounded-full ml-2 mr-1"
                      style={{ backgroundColor: MOOD_COLORS[dayData.dominantMood.toLowerCase()] }}
                    />
                    {dayData.dominantMood}
                  </p>
                </>
              ) : (
                <p>No posts on this day</p>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 30 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          const dateStr = date.toISOString().split('T')[0];
          const dayData = processedData.find((d) => d.date === dateStr);

          return (
            <motion.div
              key={dateStr}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className={`h-8 rounded-sm flex items-center justify-center text-xs cursor-pointer relative
                ${
                  !dayData
                    ? 'bg-gray-100'
                    : dayData.count > 3
                      ? 'opacity-100'
                      : dayData.count > 1
                        ? 'opacity-80'
                        : 'opacity-60'
                }
              `}
              style={{
                backgroundColor: dayData
                  ? MOOD_COLORS[dayData.dominantMood.toLowerCase()]
                  : '#f3f4f6',
              }}
              onMouseEnter={() => setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              onClick={() => setSelectedDate((prev) => (prev === dateStr ? null : dateStr))}
            >
              {date.getDate()}
              {dayData && dayData.count > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {dayData.count}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const MoodFrequencyChart = ({ posts }: { posts: BlogPost[] }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const router = useRouter();

  const moodCounts = posts.reduce(
    (acc, post) => {
      const mood = post.mood || 'neutral';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const data = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood: mood.charAt(0).toUpperCase() + mood.slice(1),
      count,
      percentage: posts.length > 0 ? Math.round((count / posts.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-xl p-6 border border-pink-100 shadow-sm">
      <h3 className="text-xl font-serif text-pink-900 mb-6">
        {selectedMood ? (
          <span>
            Posts with mood: <span className="capitalize">{selectedMood}</span>
            <button
              onClick={() => setSelectedMood(null)}
              className="ml-2 text-sm text-pink-600 hover:text-pink-800"
            >
              (Clear filter)
            </button>
          </span>
        ) : (
          'Mood Frequency'
        )}
      </h3>

      <div className="space-y-3">
        {data.map((item) => (
          <motion.div
            key={item.mood}
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`flex items-center p-2 rounded-lg transition-colors
              ${selectedMood === item.mood.toLowerCase() ? 'bg-pink-50' : ''}
            `}
            onClick={() => setSelectedMood(item.mood.toLowerCase())}
          >
            <div className="w-20 text-sm font-serif text-pink-800 capitalize">{item.mood}</div>
            <div className="flex-1">
              <div className="h-6 rounded-full bg-pink-50 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 1, type: 'spring' }}
                  style={{
                    backgroundColor: MOOD_COLORS[item.mood.toLowerCase()] || MOOD_COLORS.neutral,
                  }}
                />
                <AnimatePresence>
                  {selectedMood === item.mood.toLowerCase() && (
                    <motion.span
                      className="absolute inset-0 flex items-center justify-end pr-2 text-xs text-pink-900"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {item.count} posts
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="w-12 text-right text-sm font-serif text-gray-600">
              {item.percentage}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show filtered posts when a mood is selected */}
      <AnimatePresence>
        {selectedMood && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="border-t border-pink-100 pt-4">
              <h4 className="text-sm font-serif text-pink-900 mb-2">
                Recent "{selectedMood}" entries:
              </h4>
              <div className="space-y-2">
                {posts
                  .filter((post) => post.mood?.toLowerCase() === selectedMood)
                  .slice(0, 3)
                  .map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm font-serif hover:bg-pink-50 rounded"
                      onClick={() => router.push(`/post/${post.id}`)}
                    >
                      <div className="flex items-center">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{
                            backgroundColor: MOOD_COLORS[post.mood?.toLowerCase() || 'neutral'],
                          }}
                        />
                        <span className="truncate flex-1">{post.title}</span>
                        <span className="text-xs text-pink-600 ml-2">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
            Authorization: `Bearer ${token}`,
          },
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
  }, [router, token]);

  const navigateToPost = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const navigateToNewPost = () => {
    router.push('/post/new');
  };

  const processPostData = () => {
    if (!userData) return { weeklyData: [], moodRadarData: [] };

    const weeklyCount: Record<string, number> = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      weeklyCount[dateString] = 0;
    }

    userData.posts.forEach((post) => {
      const postDate = new Date(post.createdAt);
      const dateString = postDate.toISOString().split('T')[0];
      if (weeklyCount.hasOwnProperty(dateString)) {
        weeklyCount[dateString]++;
      }
    });

    const weeklyData = Object.entries(weeklyCount)
      .map(([date, count]) => ({
        name: date,
        posts: count,
        fullDate: new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        }),
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    const moodRadarData = Object.keys(MOOD_COLORS)
      .filter((mood) => mood !== 'neutral')
      .map((mood) => {
        const count = userData.posts.filter((post) => post.mood?.toLowerCase() === mood).length;
        const percentage =
          userData.posts.length > 0 ? Math.round((count / userData.posts.length) * 100) : 0;

        return {
          mood: mood.charAt(0).toUpperCase() + mood.slice(1),
          count,
          percentage,
          fullMark: Math.max(5, Math.ceil(userData.posts.length * 0.5)),
        };
      });

    return { weeklyData, moodRadarData };
  };

  const navigateToEditPost = (postId: string) => {
    router.push(`/post/edit/${postId}`);
  };

  const { weeklyData, moodRadarData } = processPostData();

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

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-white font-sans">
      <TopNav />
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
                  <h3 className="text-sm font-medium text-pink-600 uppercase tracking-wider">
                    Username
                  </h3>
                  <p className="mt-1 text-lg text-pink-900 font-medium">{userData.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-pink-600 uppercase tracking-wider">
                    Total Entries
                  </h3>
                  <p className="mt-1 text-lg text-pink-900 font-medium">{userData.posts.length}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-pink-600 uppercase tracking-wider">
                    Email
                  </h3>
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

        {/* Activity Chart */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100 p-6 mb-8">
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
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                  }}
                />
                <YAxis stroke="#9d174d" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderColor: '#fbcfe8',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name, props) => [
                    value,
                    name,
                    new Date(props.payload.name).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    }),
                  ]}
                  labelFormatter={() => ''}
                />
                <Bar dataKey="posts" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MoodCalendar posts={userData.posts} />
          <MoodFrequencyChart posts={userData.posts} />
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
              <p className="mt-2 text-pink-600">
                Begin your diary journey by creating your first entry
              </p>
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
                      <p className="text-lg font-serif text-pink-900 truncate">{post.title}</p>
                      <div className="mt-1 flex items-center text-sm text-pink-500">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
                        {post.mode && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="flex items-center gap-1">
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
