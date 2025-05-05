import Link from 'next/link';
import { TopNav } from '@/app/components/TopNav';
import { Search } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  postCount: number;
}

async function getAllCategories(): Promise<Category[]> {
  try {
    const res = await fetch('http://localhost:3000/category/list', {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-white font-serif">
      <TopNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-900 mb-4">
            All Categories
          </h1>
          <p className="text-xl text-pink-700 max-w-2xl mx-auto">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} available
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-16 bg-pink-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 mb-6">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-pink-900 mb-3">
              No categories found
            </h3>
            <p className="text-pink-600 max-w-md mx-auto">
              No categories have been created yet
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.id}`}
                className="bg-white rounded-xl overflow-hidden border border-pink-100 hover:shadow-lg transition-all duration-300 p-6"
              >
                <h3 className="text-xl font-semibold text-pink-800 mb-3">
                  {category.name}
                </h3>
                <p className="text-pink-600">
                  {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}