"use client";

import { Button } from "@/components/ui/button";
import { deletePost } from "@/app/actions";

export function DeletePostButton({ postId }) {
  const handleDelete = async (e) => {
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deletePost(postId);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post: " + error.message);
    }
  };

  return (
    <form action={async () => await deletePost(postId)}>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleDelete}
      >
        Delete
      </Button>
    </form>
  );
}
