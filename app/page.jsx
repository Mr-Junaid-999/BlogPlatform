import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase-server";

async function getFeaturedPosts() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:author_id (
        username,
        display_name
      ),
      tags:post_tags (
        tags (
          id,
          name,
          slug
        )
      )
    `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return posts || [];
}

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts();

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-6">
          Welcome to <span className="text-blue-600">BlogPlatform</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          A modern blogging platform where you can share your stories, ideas,
          and experiences with the world.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/blog">
            <Button size="lg">Read Blog</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Start Writing
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Posts */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Featured Posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {post.excerpt || post.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    By {post.profiles?.display_name || post.profiles?.username}
                  </span>
                  <span>
                    {new Date(post.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {featuredPosts.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No published posts yet. Be the first to write one!
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Why Choose BlogPlatform?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">✏️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Writing</h3>
            <p className="text-gray-600">
              Rich text editor with all the tools you need to create beautiful
              content.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold">🚀</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast & Reliable</h3>
            <p className="text-gray-600">
              Built with modern technology for the best performance and user
              experience.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold">💬</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Engage Readers</h3>
            <p className="text-gray-600">
              Built-in comment system to connect with your audience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
