"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getForumThread, createForumReply, upvotePost } from "@/lib/actions/forum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpCircle, Send } from "lucide-react";
import { toast } from "sonner";

function ReplyItem({ reply, depth = 0 }: { reply: any; depth?: number }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleReply() {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await createForumReply({
        postId: reply.post?.id || reply.postId, // Logic for nested replies
        content,
        parentId: reply.id,
      });
      setContent("");
      toast.success("Reply posted!");
    } catch (e: any) {
      toast.error(e.message || "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-4 mt-4", depth > 0 && "pl-6 border-l-2 border-muted ml-2")}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{reply.founder.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{reply.founder.name}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(reply.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm">{reply.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => {}}>
              Reply
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a reply..."
          className="h-8 text-xs"
        />
        <Button size="sm" className="h-8 px-2" onClick={handleReply} disabled={isSubmitting}>
          <Send className="h-3 w-3" />
        </Button>
      </div>

      {reply.replies?.map((child: any) => (
        <ReplyItem key={child.id} reply={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function ForumThreadPage() {
  const { id } = useParams();
  const [thread, setThread] = useState<any>(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteStatus, setVoteStatus] = useState(false);

  useEffect(() => {
    async function loadThread() {
      try {
        const data = await getForumThread(id as string);
        setThread(data);
      } catch (e) {
        toast.error("Failed to load thread");
      }
    }
    loadThread();
  }, [id]);

  async function handleUpvote() {
    try {
      const result = await upvotePost(id as string);
      setVoteStatus(result.upvoted);
      setThread(prev => prev ? { ...prev, _count: { ...prev._count, votes: result.upvoted ? prev._count.votes + 1 : prev._count.votes - 1 } } : null);
    } catch (e: any) {
      toast.error(e.message || "Failed to upvote");
    }
  }

  async function handleReply() {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await createForumReply({ postId: id as string, content });
      setContent("");
      toast.success("Reply posted!");
      // Refresh thread
      const updated = await getForumThread(id as string);
      setThread(updated);
    } catch (e: any) {
      toast.error(e.message || "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!thread) return <div className="flex items-center justify-center h-screen">Loading thread...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{thread.category.name}</Badge>
          <Button variant="ghost" size="sm" onClick={handleUpvote} className="gap-2">
            <ArrowUpCircle className={cn("h-4 w-4", voteStatus && "fill-primary text-primary")} />
            {thread._count.votes}
          </Button>
        </div>
        <h1 className="text-3xl font-bold">{thread.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{thread.founder.name[0]}</AvatarFallback>
          </Avatar>
          <span>{thread.founder.name}</span>
          <span>•</span>
          <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="text-base leading-relaxed">
          {thread.content}
        </div>
      </div>

      <div className="border-t pt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Replies</h3>
          <div className="flex gap-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add to the discussion..."
              className="min-h-[100px]"
            />
            <Button onClick={handleReply} disabled={isSubmitting}>
              Post Reply
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {thread.replies.map((reply: any) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
        </div>
      </div>
    </div>
  );
}
