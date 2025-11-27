import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  display_name: z.string().min(1, "Display name is required"),
});

export const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featured_image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]),
});

export const commentSchema = z.object({
  author_name: z.string().min(1, "Name is required"),
  author_email: z.string().email("Invalid email address"),
  content: z.string().min(1, "Comment is required"),
});
