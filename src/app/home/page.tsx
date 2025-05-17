import { User } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { TopNav } from '../components/TopNav';
import { ProtectedLink } from '../components/ProtectedLink';

interface Category {
  id: string;
  name: string;
}

interface CategoriesWithCount {
  categories: Category[];
  total: number;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  categories: string[];
  status: string;
  createdAt: string;
}

interface BlogPostsWithCount {
  posts: BlogPost[];
  total: number;
}

async function getCategories(): Promise<CategoriesWithCount> {
  try {
    const res = await fetch(`http://localhost:3000/category/list`);
    if (!res.ok) return { categories: [], total: 0 };
    return await res.json();
  } catch (error) {
    return { categories: [], total: 0 };
  }
}

async function getPostsByCategory(categoryName: string): Promise<BlogPostsWithCount> {
  try {
    const cleanedCategoryName = encodeURIComponent(categoryName.replaceAll(' ', '-'));

    const res = await fetch(
      `http://localhost:3000/post/category/${cleanedCategoryName}/with-pages`,
    );

    if (!res.ok) {
      console.error('Failed to fetch posts:', res.status, res.statusText);
      return { posts: [], total: 0 };
    }

    const data = await res.json();

    return {
      posts: data.posts || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], total: 0 };
  }
}

export default async function HomePage() {
  const { categories: categories = [], total: totalCategories = 0 } = await getCategories();

  const categoriesWithPosts =
    categories?.length > 0
      ? await Promise.all(
          categories.map(async (category) => {
            const { posts: posts = [], total: totalPosts = 0 } = await getPostsByCategory(
              category.name,
            );
            return {
              ...category,
              posts,
              totalPosts,
            };
          }),
        )
      : [];

  const categoriesWithPostsToShow = categoriesWithPosts.filter(
    (category) => category.posts.length > 0,
  );

  return (
    <div className="min-h-screen bg-white font-serif">
      <TopNav />

      <div className="relative py-24 px-4 text-center overflow-hidden min-h-[60vh]">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://img.freepik.com/premium-photo/notebook-with-pen-small-domestic-plant-flowerpot-branch-with-green-leaves-laptop-keypad-white-space_274679-9117.jpg?semt=ais_hybrid&w=740"
            alt="Workspace background"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-white/70" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col justify-center items-center">
          <div className="mb-8">
            <span className="text-5xl md:text-6xl font-serif italic text-pink-700 tracking-wider">
              Diary
            </span>
            <span className="block text-sm text-pink-700 mt-2 font-light tracking-widest font-serif">
              stories & reflections
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif italic text-pink-800 mb-6 leading-tight">
            Welcome to our <span className="font-bold not-italic">Diary</span>
          </h1>

          <p className="text-xl text-pink-800 max-w-2xl mx-auto font-serif">
            {categoriesWithPostsToShow.length > 0
              ? `Discover ${totalCategories} categories of extraordinary content`
              : 'No posts found in any category yet'}
          </p>

          <div className="mt-10 flex justify-center items-center gap-4">
            <div className="w-16 h-px bg-pink-300" />
            <div className="w-2 h-2 rounded-full bg-pink-400" />
            <div className="w-16 h-px bg-pink-300" />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {categoriesWithPostsToShow.length > 0 ? (
        <div className="max-w-6xl mx-auto px-4 py-16 font-serif">
          <h2 className="text-3xl font-bold text-pink-800 mb-12 text-center italic">
            Browse by Category
          </h2>

          <div className="space-y-16">
            {categoriesWithPostsToShow.map((category) => (
              <div key={category.id} className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-pink-700 italic">{category.name}</h3>
                  {category.totalPosts > 3 && (
                    <ProtectedLink
                      href={`/category/${category.id}`}
                      className="text-pink-600 hover:text-pink-800 text-sm font-medium font-serif"
                    >
                      View all {category.totalPosts} posts →
                    </ProtectedLink>
                  )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-16 font-serif">
          <div className="bg-pink-50 rounded-xl p-12 text-center">
            <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-white text-pink-600 mb-6">
              <User className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-pink-800 mb-4 italic">No posts available</h3>
            <p className="text-pink-600 max-w-md mx-auto mb-6">
              There are no posts in any category at the moment. Please check back later.
            </p>
            <ProtectedLink
              href="/home"
              className="inline-block px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors font-serif"
            >
              Refresh Page
            </ProtectedLink>
          </div>
        </div>
      )}

      {/* Pagination and CTA */}
      {categoriesWithPostsToShow.length > 0 && (
        <>
          <div className="bg-pink-50 py-16 px-4 text-center font-serif">
            <h2 className="text-2xl font-bold text-pink-800 mb-6 italic">Ready to explore more?</h2>
            <ProtectedLink
              href="/categories"
              className="inline-block px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
            >
              Browse All {totalCategories} Categories
            </ProtectedLink>
          </div>
        </>
      )}
    </div>
  );
}
