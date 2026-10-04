"use client";

import React, { useState, useEffect } from "react";
import { listChannels } from "@/lib/actions/chat";
import { ChatWindow } from "@/components/chat/chat-window";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ConversionGuard } from "@/components/community/conversion-guard";
import { PageSidebar } from "@/components/ui/page-sidebar";

export default function ChatPage() {
  return (
    <ConversionGuard featureName="Live Chat">
      <ChatContent />
    </ConversionGuard>
  );
}

function ChannelSidebar({ channels, activeChannelId, onSelect }: {
  channels: { id: string; name: string; description: string | null }[];
  activeChannelId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <>
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
              onClick={() => onSelect(channel.id)}
            >
              # {channel.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}

function ChatContent() {
  const [channels, setChannels] = useState<{ id: string; name: string; description: string | null }[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    return (
      <div className="space-y-2" aria-hidden>
        <div className="h-12 w-full bg-muted animate-pulse rounded-xl" />
        <div className="h-[70vh] w-full bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Chat</h1>
        <p className="text-muted-foreground mt-1">
          Real-time conversations with your fellow founders.
        </p>
      </div>

      <div className="flex h-[70vh] min-h-[420px] rounded-xl border bg-background overflow-hidden">
        <aside className="hidden md:flex w-64 border-r bg-muted/30 flex-col">
          <ChannelSidebar channels={channels} activeChannelId={activeChannelId} onSelect={setActiveChannelId} />
        </aside>

        <PageSidebar label="Channels" open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <ChannelSidebar
            channels={channels}
            activeChannelId={activeChannelId}
            onSelect={(id) => { setActiveChannelId(id); setSidebarOpen(false); }}
          />
        </PageSidebar>

        <main className="flex-1 flex flex-col bg-background min-w-0">
          {activeChannel ? (
            <ChatWindow channelId={activeChannelId!} channelName={activeChannel.name} onOpenChannels={() => setSidebarOpen(true)} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a channel to start chatting
            </div>
          )}
        </main>
      </div>
    </div>
  );
}