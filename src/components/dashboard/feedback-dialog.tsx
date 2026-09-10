"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function FeedbackDialog() {
  const [feedback, setFeedback] = useState("");

  function handleSubmit() {
    if (!feedback.trim()) return;
    const subject = encodeURIComponent("FounderFlow Feedback");
    const body = encodeURIComponent(feedback.trim());
    window.open(
      `mailto:faizaanoffice777@gmail.com?subject=${subject}&body=${body}`,
      "_blank"
    );
    setFeedback("");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          title="Send feedback"
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve FounderFlow.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Tell us what you think..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" onClick={handleSubmit} disabled={!feedback.trim()}>
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
