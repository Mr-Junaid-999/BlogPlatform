import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deletePost } from "@/app/actions";
import { DeletePostButton } from "./delete-post-button";

async function getPosts() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // First, fetch posts with basic info
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
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  if (!posts || posts.length === 0) {
    return [];
  }

  // Get all post IDs for batch queries
  const postIds = posts.map((post) => post.id);

  // Fetch likes count for all posts
  const { data: likesData, error: likesError } = await supabase
    .from("likes")
    .select("post_id")
    .in("post_id", postIds);

  console.log("likesData", likesData);

  // Fetch comments count for all posts
  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("post_id, status")
    .in("post_id", postIds);

  console.log("commentsData", commentsData);

  if (likesError) {
    console.error("Error fetching likes:", likesError);
  }

  if (commentsError) {
    console.error("Error fetching comments:", commentsError);
  }

  // Count likes and comments for each post
  const likesCountMap = {};
  const commentsCountMap = {};

  // Count likes
  if (likesData) {
    likesData.forEach((like) => {
      likesCountMap[like.post_id] = (likesCountMap[like.post_id] || 0) + 1;
    });
  }

  // Count approved comments only
  if (commentsData) {
    commentsData.forEach((comment) => {
      if (comment.status === "approved") {
        commentsCountMap[comment.post_id] =
          (commentsCountMap[comment.post_id] || 0) + 1;
      }
    });
  }

  // Combine all data
  const postsWithCounts = posts.map((post) => ({
    ...post,
    likes: [{ count: likesCountMap[post.id] || 0 }],
    comments: [{ count: commentsCountMap[post.id] || 0 }],
  }));

  return postsWithCounts;
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Posts</h1>
          <p className="text-gray-600">Create and manage your blog posts</p>
        </div>
        <Link href="/admin/posts/create">
          <Button>Create New Post</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-blue-600"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {post.status}
                      </span>
                      <span>
                        Created:{" "}
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      {post.published_at && (
                        <span>
                          Published:{" "}
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      )}
                      <span>{post.likes?.[0]?.count || 0} likes</span>
                      <span>{post.comments?.[0]?.count || 0} comments</span>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.tags.map(({ tags }) => (
                          <span
                            key={tags.id}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {tags.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-gray-600 text-sm">
                      {post.excerpt || post.content.substring(0, 150)}...
                    </p>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Link href={`/admin/posts/edit/${post.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <DeletePostButton postId={post.id} />
                  </div>
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first blog post to get started
                </p>
                <Link href="/admin/posts/create">
                  <Button>Create Your First Post</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
