import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { Button } from "@/components/ui/button";
import { toggleLike } from "@/app/actions";

async function getPost(Slug) {
  const slug = await Slug;

  try {
    const supabase = await createClient();

    const { data: post, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles:author_id (
          username,
          display_name,
          bio,
          avatar_url
        ),
        tags:post_tags (
          tags (
            id,
            name,
            slug
          )
        ),
        likes(count),
        comments:comments!parent_id (
          id,
          content,
          author_name,
          author_email,
          post_id,
          parent_id,
          status,
          created_at
        )
      `
      )
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !post) {
      return null;
    }

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

// Like Button Client Component (Separate banayein)
function LikeButton({ postId, initialLikes }) {
  return (
    <form action={toggleLike.bind(null, postId)}>
      <Button type="submit" variant="outline" size="sm">
        ❤️ {initialLikes} Likes
      </Button>
    </form>
  );
}

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const approvedComments =
    post.comments?.filter((comment) => comment.status === "approved") || [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <article className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
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
            </div>
            <LikeButton
              postId={post.id}
              initialLikes={post.likes?.length || 0}
            />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(({ tags }) => (
                <Link
                  key={tags.id}
                  href={`/blog/tag/${tags.slug}`}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                >
                  {tags.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Post Content */}
        <div
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Post Footer */}
        <footer className="border-t pt-6">
          <div className="flex items-center justify-between">
            <LikeButton
              postId={post.id}
              initialLikes={post.likes?.length || 0}
            />
            <div className="text-sm text-gray-500">
              Published on{" "}
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString()
                : "Not published"}
            </div>
          </div>
        </footer>
      </article>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

        <div className="mb-8">
          <CommentForm postId={post.id} />
        </div>

        <CommentList comments={approvedComments} />
      </div>
    </div>
  );
}
