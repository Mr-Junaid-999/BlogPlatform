//app/actions.js
"use server";

import { createClient } from "@/lib/supabase-server";
import { generateSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation schemas
const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featured_image: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  tags: z.array(z.string()).optional().default([]),
});

const commentSchema = z.object({
  author_name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Comment is required"),
  post_id: z.string().uuid("Invalid post ID"),
  author_email: z.string().email("Invalid email"),
  status: z.enum(["pending", "approved"]).default("pending"),
});

// Auth Actions
export async function signUp(formData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");
  const username = formData.get("username");
  const display_name = formData.get("display_name");

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username,
      display_name,
      email: authData.user.email,
    });

    if (profileError) {
      throw new Error(profileError.message);
    }
  }

  redirect("/admin");
}

export async function signIn(formData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }

  redirect("/");
}

// Post Actions
export async function createPost(formData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Tags ko extract + convert
  const tags = formData.get("tags") || "";
  const tagsArray = tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);
  formData.delete("tags");
  tagsArray.forEach((tag) => formData.append("tags", tag));

  // Raw data ready for validation
  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt"),
    featured_image: formData.get("featured_image"),
    tags: formData.getAll("tags"),
    status: formData.get("status"),
  };

  const validatedData = postSchema.parse(rawData);

  const slug = generateSlug(validatedData.title);
  const published_at =
    validatedData.status === "published" ? new Date().toISOString() : null;

  // 👇 Tags field remove kar ke insert karo
  const { tags: postTags, ...postData } = validatedData;

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      ...postData, // ✅ idhar tags nahi jayen ge
      slug,
      author_id: user.id,
      published_at,
    })
    .select()
    .single();

  if (postError) {
    throw new Error(postError.message);
  }

  // Baad me tags ko `post_tags` me insert karo
  if (postTags && postTags.length > 0) {
    for (const tagName of postTags) {
      let { data: tag } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .single();

      if (!tag) {
        const { data: newTag } = await supabase
          .from("tags")
          .insert({
            name: tagName,
            slug: generateSlug(tagName),
          })
          .select()
          .single();
        tag = newTag;
      }

      if (tag) {
        await supabase.from("post_tags").insert({
          post_id: post.id,
          tag_id: tag.id,
        });
      }
    }
  }

  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function updatePost(id, formData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt"),
    featured_image: formData.get("featured_image"),
    tags: formData.getAll("tags"),
    status: formData.get("status"),
  };

  const validatedData = postSchema.parse(rawData);

  const slug = generateSlug(validatedData.title);
  const published_at =
    validatedData.status === "published" ? new Date().toISOString() : null;

  // 👇 Tags field remove kar ke insert karo
  const { tags: postTags, ...postData } = validatedData;

  const { error: postError } = await supabase
    .from("posts")
    .update({
      ...postData,
      slug,
      published_at,
    })
    .eq("id", id)
    .eq("author_id", user.id);

  if (postError) {
    throw new Error(postError.message);
  }

  // Update tags
  await supabase.from("post_tags").delete().eq("post_id", id);

  if (validatedData.tags && validatedData.tags.length > 0) {
    for (const tagName of validatedData.tags) {
      let { data: tag } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .single();

      if (!tag) {
        const { data: newTag } = await supabase
          .from("tags")
          .insert({
            name: tagName,
            slug: generateSlug(tagName),
          })
          .select()
          .single();
        tag = newTag;
      }

      if (tag) {
        await supabase.from("post_tags").insert({
          post_id: id,
          tag_id: tag.id,
        });
      }
    }
  }

  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(id) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/blog");
  revalidatePath("/admin/posts");
}

export async function createComment(commentData) {
  const supabase = await createClient();
  const validatedData = commentSchema.parse(commentData);

  const { error } = await supabase.from("comments").insert(validatedData);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/blog/${commentData.post_id}`);
}

export async function updateCommentStatus(id, status) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("comments")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/comments");
}

export async function deleteComment(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/comments");
}
//app/actions.js
// Like Actions
// export async function toggleLike(postId) {
//   const supabase = await createClient();
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     throw new Error("User not authenticated");
//   }

//   const { data: existingLike } = await supabase
//     .from("likes")
//     .select("id")
//     .eq("post_id", postId)
//     .eq("user_id", user.id)
//     .single();

//   if (existingLike) {
//     await supabase.from("likes").delete().eq("id", existingLike.id);
//   } else {
//     await supabase.from("likes").insert({
//       post_id: postId,
//       user_id: user.id,
//     });
//   }

//   revalidatePath(`/blog/${postId}`);
// }
// app/actions.js

export async function toggleLike(formData) {
  const postId = formData.get("postId");

  if (!postId) {
    throw new Error("Post ID is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Check if user already liked the post
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("id", existingLike.id);

    if (error) throw error;
  } else {
    // Like
    const { error } = await supabase.from("likes").insert({
      post_id: postId,
      user_id: user.id,
    });

    if (error) throw error;
  }

  // Properly revalidate the path
  revalidatePath(`/blog/[slug]`);

  return { success: true, postId };
}
