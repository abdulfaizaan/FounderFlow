"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getForumCategories, createForumPost } from "@/lib/actions/forum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", categoryId: "" });

  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await getForumCategories();
        setCategories(cats);
      } catch (e) {
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    }
    loadCats();
  }, []);

  async function handleSubmit() {
    if (!formData.title || !formData.content || !formData.categoryId) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createForumPost(formData);
      toast.success("Post created successfully!");
      router.push("/forum");
    } catch (e: any) {
      toast.error(e.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Create New Discussion</h1>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            placeholder="What's on your mind?"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={formData.categoryId}
            onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <Textarea
            placeholder="Share your thoughts, questions, or experiences..."
            className="min-h-[300px]"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post Discussion"}
          </Button>
        </div>
      </div>
    </div>
  );
}
