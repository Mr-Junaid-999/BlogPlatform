import { updatePost } from "@/app/actions";
import { createClient } from "@/lib/supabase-server";
import { EditPostForm } from "./edit-post-form";

// Fetch post on server
export default async function EditPostPage({ params }) {
  const supabase = await createClient();
  const slug = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
        *,
        tags:post_tags (
          tags ( id, name )
        )
      `
    )
    .eq("id", slug.id)
    .single();

  if (error || !post) {
    return <div className="text-center py-12 text-red-600">Post not found</div>;
  }

  // Convert nested tags to comma string
  const tagNames = post.tags?.map(({ tags }) => tags.name).join(", ") || "";

  // Server submit function
  async function handleServerSubmit(formData) {
    "use server";
    await updatePost(slug.id, formData);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-600">Update your blog post</p>
      </div>

      <EditPostForm
        post={post}
        tagNames={tagNames}
        onSubmit={handleServerSubmit}
        postId={slug.id}
      />
    </div>
  );
}
