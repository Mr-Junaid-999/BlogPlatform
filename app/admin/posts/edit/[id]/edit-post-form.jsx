"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "@/components/RichTextEditor";

export function EditPostForm({ post, tagNames, onSubmit, postId }) {
  const handleEditorChange = (val) => {
    const input = document.querySelector('input[name="content"]');
    if (input) input.value = val;
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Form submits using server action */}
        <form action={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              name="title"
              defaultValue={post.title}
              placeholder="Enter post title"
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <Textarea
              name="excerpt"
              defaultValue={post.excerpt || ""}
              placeholder="Brief description of your post (optional)"
              rows={3}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image URL
            </label>
            <Input
              name="featured_image"
              defaultValue={post.featured_image || ""}
              placeholder="https://example.com/image.jpg"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <Input
              name="tags"
              defaultValue={tagNames}
              placeholder="technology, programming, web-development (comma separated)"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate tags with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>

            {/* Store editor value into hidden input for server */}
            <input
              type="hidden"
              name="content"
              defaultValue={post.content || ""}
            />

            <RichTextEditor
              value={post.content}
              onChange={handleEditorChange}
              height={400}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              defaultValue={post.status}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="draft">Draft</option>
              <option value="published">Publish</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link href="/admin/posts">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>

            {/* <button type="submit"> */}
            <Button type="submit">Update Post</Button>
            {/* </button> */}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
