import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, User } from 'lucide-react'
import { Comments } from '@/app/components/Comments'
import { TopNav } from '@/app/components/TopNav'

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  categories: string[]
  status: string
  createdAt: string
}

interface BlogPostsWithCount {
  posts: BlogPost[]
  total: number
}

async function getPost(params: any): Promise<BlogPost | null> {
  try {
    const res = await fetch(`http://localhost:3000/post/${params.id}`, {
      next: { revalidate: 60 }
    })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    return null
  }
}

async function getUserPosts(post: any): Promise<BlogPostsWithCount> {
  try {
    post = await post;
    const res = await fetch(`http://localhost:3000/post/user/${post.author}?page=1&limit=3`)
    if (!res.ok) {
      console.error("Failed to fetch posts:", res.status, res.statusText);
      return { posts: [], total: 0 };
    }
    const data = await res.json();
    return {
      posts: data.posts || [],
      total: data.total || 0
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], total: 0 };
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  params = await params;
  const post = await getPost(params);
  
  return {
    title: post?.title || 'Post Not Found',
    description: post?.content.slice(0, 160) || '',
  }
}

export default async function Page({
  params,
}: {
  params: { id: string }
}) {
  params = await params;
  const post = await getPost(params)
  if (!post) return notFound()

  const { posts: userPosts } = await getUserPosts(post);

  return (
    <div className="min-h-screen bg-white font-serif">
      <TopNav />
      
      <div className="relative pt-32 pb-24 px-4 bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {post.categories.map((category) => (
              <span
                key={category}
                className="px-4 py-2 text-sm font-medium bg-white text-pink-600 border border-pink-200 rounded-full shadow-sm"
              >
                {category}
              </span>
            ))}
          </div>
          
          <h1 className="text-5xl font-bold text-pink-900 mb-8 leading-tight text-center">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-pink-700 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <User className="h-5 w-5 text-pink-600" />
              </div>
              <span className="font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-pink-600" />
              </div>
              <span>
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          <div className="mt-10 flex justify-center items-center gap-4">
            <div className="w-16 h-px bg-pink-300" />
            <div className="w-2 h-2 rounded-full bg-pink-400" />
            <div className="w-16 h-px bg-pink-300" />
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <article className="prose prose-lg lg:prose-xl max-w-none text-black">
          <div className="border-t border-pink-100 pt-12" />
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </div>

      {/* Comments Section */}
      <Comments postId={params.id} />

      {/* More from Author Section */}
      <div className="bg-pink-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-pink-900 mb-16 text-center">
            More from <span className="italic">{post.author}</span>
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
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
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
                No other posts yet
              </h3>
              <p className="text-pink-600 max-w-md mx-auto">
                {post.author} hasn't published any other articles yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}