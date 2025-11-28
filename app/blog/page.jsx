import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase-server";
import { SearchBar } from "@/components/SearchBar";

// Server page
export default async function BlogPage({ searchParams }) {
  const supabase = await createClient();
  const search = await searchParams?.search;

  // Fetch posts
  let query = supabase
    .from("posts")
    .select(
      `
        *,
        profiles:author_id ( username, display_name ),
        tags:post_tags ( tags ( id, name, slug ) )
      `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const { data: posts = [], error: postsError } = await query;

  if (postsError) {
    console.error("Error fetching posts:", postsError.message);
  }

  // Fetch likes count for each post separately
  const postsWithLikes = await Promise.all(
    posts.map(async (post) => {
      const { count, error } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);

      return {
        ...post,
        likesCount: count || 0,
      };
    })
  );

  // Fetch tags
  const { data: tags = [], error: tagsError } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  if (tagsError) {
    console.error("Error fetching tags:", tagsError.message);
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Blog Posts
            </h1>

            <SearchBar />
          </div>

          <div className="space-y-6">
            {postsWithLikes.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>

                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>
                      By{" "}
                      {post.profiles?.display_name ||
                        post.profiles?.username ||
                        "Unknown"}
                    </span>
                    <span>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : "Draft"}
                    </span>
                    <span>{post.likesCount} likes</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt ||
                      (post.content ? post.content.substring(0, 200) : "")}
                    ...
                  </p>

                  {/* Render tags if exist */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(({ tags }) => (
                        <Link
                          key={tags.id}
                          href={`/blog/tag/${tags.slug}`}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200"
                        >
                          {tags.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="outline">Read More</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}

            {postsWithLikes.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-600">
                  {search
                    ? "Try adjusting your search terms."
                    : "Check back later for new posts."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                  >
                    {tag.name}
                  </Link>
                ))}

                {tags.length === 0 && (
                  <p className="text-gray-500 text-sm">No tags yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
