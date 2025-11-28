// components/ui/LikeButton.jsx
"use client";
import React, { useOptimistic, useState } from "react";
import { toggleLike } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function LikeButton({ postId, initialLikes, isInitiallyLiked }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [optimisticState, addOptimistic] = useOptimistic(
    { likes: initialLikes, isLiked: isInitiallyLiked },
    (state) => ({
      likes: state.isLiked ? state.likes - 1 : state.likes + 1,
      isLiked: !state.isLiked,
    })
  );

  const handleSubmit = async (formData) => {
    setIsLoading(true);

    try {
      addOptimistic();

      const result = await toggleLike(formData);

      if (result.success) {
        // Refresh the page to get updated data
        router.refresh();
      }
    } catch (error) {
      console.error("Error toggling like:", error);

      // Revert optimistic update on error
      addOptimistic();

      if (error.message.includes("not authenticated")) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="postId" value={postId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={isLoading}
        className={`
          transition-all duration-200 
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
          ${
            optimisticState.isLiked
              ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
              : "bg-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }
        `}
      >
        {optimisticState.isLiked ? (
          <span className="flex items-center gap-1">
            ❤️ {optimisticState.likes} Likes
          </span>
        ) : (
          <span className="flex items-center gap-1">
            🤍 {optimisticState.likes} Likes
          </span>
        )}
        {isLoading && "..."}
      </Button>
    </form>
  );
}

export default LikeButton;
