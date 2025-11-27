"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { commentSchema } from "@/lib/validations";
import { createComment } from "@/app/actions";

export function CommentForm({ postId, parentId, onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data) => {
    try {
      await createComment({
        ...data,
        post_id: postId,
        parent_id: parentId || null,
      });
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input placeholder="Your Name" {...register("author_name")} />
          {errors.author_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.author_name.message}
            </p>
          )}
        </div>
        <div>
          <Input
            type="email"
            placeholder="Your Email"
            {...register("author_email")}
          />
          {errors.author_email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.author_email.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <Textarea
          placeholder="Your Comment"
          rows={4}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Comment"}
      </Button>
    </form>
  );
}
