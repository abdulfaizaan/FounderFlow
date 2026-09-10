"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Menu } from "lucide-react";
import Pusher from "pusher-js";
import { getMessages, sendMessage } from "@/lib/actions/chat";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  founder: { name: string };
}

export function ChatWindow({ channelId, channelName, onOpenChannels }: { channelId: string; channelName: string; onOpenChannels?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getMessages(channelId);
        setMessages(data);
      } catch (e) {
        toast.error("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    }
    loadMessages();

    // Subscribe to Pusher
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    let pusher: InstanceType<typeof Pusher> | null = null;
    let channel: ReturnType<InstanceType<typeof Pusher>["subscribe"]> | null = null;

    if (pusherKey && pusherCluster) {
      pusher = new Pusher(pusherKey, { cluster: pusherCluster });
      channel = pusher.subscribe(`channel-${channelId}`);
      channel.bind("new-message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      if (channel && pusher) {
        pusher.unsubscribe(`channel-${channelId}`);
      }
    };
  }, [channelId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const { register, handleSubmit, reset } = useForm<{ content: string }>();

  const onSubmit = async (data: { content: string }) => {
    try {
      await sendMessage(channelId, data.content);
      reset();
    } catch (e: any) {
      toast.error(e.message || "Failed to send message");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenChannels} aria-label="Open channels">
          <Menu className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{channelName}</h2>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[80%]"
            >
              <Avatar>
                <AvatarFallback>{msg.founder.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{msg.founder.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t flex gap-2">
        <Input
          {...register("content", { required: true })}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
