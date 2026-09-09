"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getForumCategories, getForumThreads } from "@/lib/actions/forum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, ArrowUpCircle, Search } from "lucide-react";
import { motion } from "framer-motion";
import { ConversionGuard } from "@/components/community/conversion-guard";

export default function ForumPage() {
  return (
    <ConversionGuard featureName="Founder Forum">
      <ForumContent />
    </ConversionGuard>
  );
}

function ForumContent() {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [threads, setThreads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadForum() {
      try {
        const cats = await getForumCategories();
        setCategories(cats);
        const { posts } = await getForumThreads({ categoryId: activeCategory, search });
        setThreads(posts);
      } catch (e) {
        console.error("Failed to load forum", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadForum();
  }, [activeCategory, search]);

  return (
    <div className="flex gap-6 h-full">
      <aside className="w-64 flex flex-col gap-4">
        <div className="p-4 bg-muted/30 rounded-xl border">
          <h3 className="font-semibold mb-3">Categories</h3>
          <div className="space-y-1">
            <Button
              variant={!activeCategory ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveCategory(null)}
            >
              All Discussions
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => window.location.href = "/forum/new"}>
            New Post
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid gap-4">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-xl" />
              ))
            ) : threads.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No discussions found. Start the conversation!
              </div>
            ) : (
              threads.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Link href={`/forum/${post.id}`}>
                    <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{post.category.name}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Posted by {post.founder.name}
                            </span>
                          </div>
                          <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {post.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {post.content}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                            {post._count.votes}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            {post._count.replies}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
