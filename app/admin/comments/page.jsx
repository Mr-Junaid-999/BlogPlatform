import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCommentStatus, deleteComment } from "@/app/actions";

async function getComments() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get comments for posts authored by current user
  const { data: comments, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      posts (
        id,
        title,
        slug,
        author_id
      )
    `
    )
    .eq("posts.author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return comments || [];
}

export default async function CommentsPage() {
  const comments = await getComments();

  const pendingComments = comments.filter((c) => c.status === "pending");
  const approvedComments = comments.filter((c) => c.status === "approved");
  const spamComments = comments.filter((c) => c.status === "spam");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Comments</h1>
        <p className="text-gray-600">Moderate comments on your posts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <span className="text-2xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingComments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedComments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spam</CardTitle>
            <span className="text-2xl">🚫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spamComments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Comments */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Comments ({pendingComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}

            {pendingComments.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No pending comments
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approved Comments */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Approved Comments ({approvedComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}

            {approvedComments.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No approved comments
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spam Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Spam Comments ({spamComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spamComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}

            {spamComments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No spam comments</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Comment Item Component
function CommentItem({ comment }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">{comment.author_name}</h4>
          <p className="text-sm text-gray-500">{comment.author_email}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>{new Date(comment.created_at).toLocaleDateString()}</div>
          <div
            className={`px-2 py-1 rounded-full text-xs ${
              comment.status === "approved"
                ? "bg-green-100 text-green-800"
                : comment.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {comment.status}
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{comment.content}</p>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          On post: <strong>{comment.posts?.title}</strong>
        </div>

        <div className="flex space-x-2">
          {comment.status === "pending" && (
            <>
              <form
                action={updateCommentStatus.bind(null, comment.id, "approved")}
              >
                <Button type="submit" variant="outline" size="sm">
                  Approve
                </Button>
              </form>
              <form action={updateCommentStatus.bind(null, comment.id, "spam")}>
                <Button type="submit" variant="outline" size="sm">
                  Spam
                </Button>
              </form>
            </>
          )}

          <form action={deleteComment.bind(null, comment.id)}>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              onClick={(e) => {
                if (!confirm("Are you sure you want to delete this comment?")) {
                  e.preventDefault();
                }
              }}
            >
              Delete
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
