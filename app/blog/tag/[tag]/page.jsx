import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getPostsByTag(tagSlug) {
  try {
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
        ),
        likes(count)
      `
      )
      .eq("status", "published")
      .eq("tags.tags.slug", tagSlug)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return posts || [];
  } catch (error) {
    console.error("Failed to fetch posts by tag:", error);
    return [];
  }
}

async function getTag(tagSlug) {
  try {
    const supabase = await createClient();

    const { data: tag, error } = await supabase
      .from("tags")
      .select("*")
      .eq("slug", tagSlug)
      .single();

    if (error) {
      return null;
    }

    return tag;
  } catch (error) {
    console.error("Failed to fetch tag:", error);
    return null;
  }
}

export default async function TagPage({ params }) {
  const posts = await getPostsByTag(params.tag);
  const tag = await getTag(params.tag);

  if (!tag) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tag not found</h1>
        <Link href="/blog">
          <Button>Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Posts tagged with &quot;{tag.name}&quot;
        </h1>
        <p className="text-gray-600">
          {posts.length} post{posts.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
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
                <span>{post.likes?.length || 0} likes</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {post.excerpt ||
                  (post.content ? post.content.substring(0, 200) : "")}
                ...
              </p>

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

        {posts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No posts found
            </h3>
            <p className="text-gray-600 mb-4">
              No posts have been tagged with &quot;{tag.name}&quot; yet.
            </p>
            <Link href="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
