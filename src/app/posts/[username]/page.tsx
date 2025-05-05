// app/posts/user/[username]/page.tsx
import Link from 'next/link';
import { CalendarDays, User, Search } from 'lucide-react';
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

interface BlogPostsWithCount {
  posts: BlogPost[];
  total: number;
}

async function getUserPosts(username: string, sort: 'newest' | 'oldest' = 'newest'): Promise<BlogPostsWithCount> {
  try {
    const res = await fetch(`http://localhost:3000/post/user/${username}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return { posts: [], total: 0 };
    }
    
    const data = await res.json();
    
    data.posts.sort((a: BlogPost, b: BlogPost) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return { posts: [], total: 0 };
  }
}

export default async function UserPostsPage({
  params,
  searchParams,
}: {
  params: { username: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const username = decodeURIComponent(params.username);
  const sort = typeof searchParams.sort === 'string' ? 
    (searchParams.sort === 'oldest' ? 'oldest' : 'newest') : 'newest';
  
  const { posts, total } = await getUserPosts(username, sort);

  return (
    <div className="min-h-screen bg-white font-serif">
      <TopNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-900 mb-4">
            {username}'s Diary Entries
          </h1>
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

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-pink-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 mb-6">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-pink-900 mb-3">
              No posts found
            </h3>
            <p className="text-pink-600 max-w-md mx-auto">
              {username} hasn't created any posts yet
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-xl overflow-hidden border border-pink-100 hover:shadow-lg transition-all duration-300"
              >
                <Link href={`/post/${post.id}`}>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.categories.slice(0, 2).map((category, index) => (
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