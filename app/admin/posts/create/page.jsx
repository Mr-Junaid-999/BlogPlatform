import Link from "next/link";
import { createPost } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function CreatePostPage() {
  async function handleServerSubmit(formData) {
    "use server";
    await createPost(formData);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600">Write and publish a new blog post</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form action={handleServerSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                name="title"
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
              {/* RichTextEditor syncs content to hidden input */}
              <input type="hidden" name="content" defaultValue="" />
              <RichTextEditor height={400} inputName="content" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                defaultValue="draft"
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
              <Button type="submit">Create Post</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
