"use client";

import React, { useState, useEffect } from "react";
import { listChannels } from "@/lib/actions/chat";
import { ChatWindow } from "@/components/chat/chat-window";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ConversionGuard } from "@/components/community/conversion-guard";

export default function ChatPage() {
  return (
    <ConversionGuard featureName="Live Chat">
      <ChatContent />
    </ConversionGuard>
  );
}

function ChatContent() {
  const [channels, setChannels] = useState<{ id: string; name: string; description?: string }[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadChannels() {
      try {
        const data = await listChannels();
        setChannels(data);
        if (data.length > 0) {
          setActiveChannelId(data[0].id);
        }
      } catch (e) {
        console.error("Failed to load channels");
      } finally {
        setIsLoading(false);
      }
    }
    loadChannels();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading community chat...</div>;
  }

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  return (
    <div className="flex h-[calc(100vh-64px)] border rounded-lg overflow-hidden bg-background">
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Channels</h3>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant={activeChannelId === channel.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-normal",
                  activeChannelId === channel.id && "bg-accent"
                )}
                onClick={() => setActiveChannelId(channel.id)}
              >
                # {channel.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col bg-background">
        {activeChannel ? (
          <ChatWindow channelId={activeChannelId!} channelName={activeChannel.name} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a channel to start chatting
          </div>
        )}
      </main>
    </div>
  );
}
