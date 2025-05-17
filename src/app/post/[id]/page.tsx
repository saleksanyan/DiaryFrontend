import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, User } from 'lucide-react';
import { Comments } from '@/app/components/Comments';
import { TopNav } from '@/app/components/TopNav';
import { MoreFromAuthor } from '../MoreFromAuthor.client';
import '../../post-styles.css';
import { MOOD_COLORS } from '@/app/components/UserProfile';
import { LikeButton } from '@/app/components/LikeButton';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  categories: string[];
  status: string;
  createdAt: string;
  mood: string;
  likes: number;
}

async function getPost(params: any): Promise<BlogPost | null> {
  try {
    const res = await fetch(`http://localhost:3000/post/${params.id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      ...data,
      likes: data.likes || 0,
    };
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  params = await params;

  const post = await getPost(params);

  return {
    title: post?.title || 'Post Not Found',
    description: post?.content.slice(0, 160) || '',
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  params = await params;
  const post = await getPost(params);
  if (!post) return notFound();
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
                  day: 'numeric',
                })}
              </span>
              {post.mood && (
                <>
                  <span className="mx-1">•</span>
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
              <span className="mx-1">•</span>
              <div className="border border-red-500 p-1">
                <LikeButton id={post.id} initialLikes={post.likes} />
              </div>
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
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </div>

      {/* Comments Section */}
      <Comments postId={params.id} postAuthorName={post.author} />

      {/* More from Author Section - Client component with auth */}
      <MoreFromAuthor author={post.author} currentPostId={params.id} />
    </div>
  );
}
