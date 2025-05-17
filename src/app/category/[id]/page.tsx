import CategoryPostsClient from './CategoryPostsClient';

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

async function getPostsByCategory(
  id: string,
  token?: string,
  sort: 'newest' | 'oldest' = 'newest',
): Promise<BlogPostsWithCount> {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const categoryRes = await fetch(`http://localhost:3000/category/${id}`, {
      headers,
    });

    const category = await categoryRes.json();

    const res = await fetch(`http://localhost:3000/post/category/${category.name}`, {
      next: { revalidate: 60 },
      headers,
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
    console.error('Error fetching posts by category:', error);
    return { posts: [], total: 0 };
  }
}

export default async function CategoryPostsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  params = await params;
  searchParams = await searchParams;
  const id = decodeURIComponent(params.id);
  const sort =
    typeof searchParams.sort === 'string'
      ? searchParams.sort === 'oldest'
        ? 'oldest'
        : 'newest'
      : 'newest';

  const { posts, total } = await getPostsByCategory(id, undefined, sort);

  return <CategoryPostsClient initialPosts={posts} initialTotal={total} id={id} sort={sort} />;
}
