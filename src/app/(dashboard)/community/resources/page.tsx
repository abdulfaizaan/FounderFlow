"use client";

import React, { useState, useEffect } from "react";
import { getResources, createResource } from "@/app/actions/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ExternalLink, Plus } from "lucide-react";
import { ConversionGuard } from "@/components/community/conversion-guard";

export default function ResourcesPage() {
  return (
    <ConversionGuard featureName="Resource Library">
      <ResourcesContent />
    </ConversionGuard>
  );
}

function ResourcesContent() {
  const [resources, setResources] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", url: "", category: "", tags: "" });

  useEffect(() => {
    async function loadResources() {
      setIsLoading(true);
      try {
        const data = await getResources({ category, search });
        setResources(data);
      } catch (e) {
        toast.error("Failed to load resources");
      } finally {
        setIsLoading(false);
      }
    }
    loadResources();
  }, [category, search]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await createResource({
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()),
      });
      toast.success("Resource submitted!");
      setIsModalOpen(false);
      setFormData({ title: "", description: "", url: "", category: "", tags: "" });
      // Refresh resources
      const data = await getResources({ category, search });
      setResources(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit resource");
    } finally {
      setIsSubmitting(false);
    }
  }

  const categories = ["Guide", "Template", "Tool", "Article"];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Library</h1>
          <p className="text-muted-foreground">Curated guides and tools for solo founders.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Submit Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit a Resource</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full rounded-md border p-2 text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Resource"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search resources..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(category === cat ? "" : cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 w-full bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <Card key={res.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">{res.category}</Badge>
                  <a href={res.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <h3 className="text-xl font-semibold">{res.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{res.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">By {res.founder.name}</span>
                <div className="flex gap-1">
                  {res.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px] px-1">{tag}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
