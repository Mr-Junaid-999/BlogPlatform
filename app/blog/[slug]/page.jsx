//app/blog/[slug]/page.jsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import LikeButton from "@/components/ui/LikeButton";

async function getPost(params) {
  const resolvedParams = await params;
  const slugValue = resolvedParams.slug;

  try {
    const supabase = await createClient();

    // Get current user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: posts, error } = await supabase
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
        )
      `
      )
      .eq("slug", slugValue)
      .in("status", ["published", "draft"]) // Both published and draft posts
      .limit(1);

    if (error) {
      console.error("Query error:", error);
      return null;
    }

    if (!posts || posts.length === 0) {
      return null;
    }

    const post = posts[0];

    // Additional security: If post is draft, only author or admin can view
    if (post.status === "draft") {
      if (!user) {
        return null;
      }

      // Check if current user is the author or has admin role
      const isAuthor = post.author_id === user.id;
      // You might want to check user role here if you have roles implemented

      if (!isAuthor) {
        return null;
      }
    }

    // Get likes count for this post
    const { count: likesCount, error: likesError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);

    if (likesError) {
      console.error("Likes count error:", likesError);
    }

    // Check if current user has liked this post
    let userHasLiked = false;
    if (user) {
      const { data: userLike, error: userLikeError } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", user.id)
        .single();

      if (userLikeError && userLikeError.code !== "PGRST116") {
        console.error("User like check error:", userLikeError);
      }

      userHasLiked = !!userLike;
    }

    // Fetch comments separately using post_id
    const { data: comments = [] } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post.id);

    return {
      ...post,
      comments,
      userHasLiked,
      likesCount: likesCount || 0,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export default async function PostPage({ params }) {
  const post = await getPost(params);

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
              initialLikes={post.likesCount}
              isInitiallyLiked={post.userHasLiked}
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
              initialLikes={post.likesCount}
              isInitiallyLiked={post.userHasLiked}
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
