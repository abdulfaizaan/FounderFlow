"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getWikiStructure, createWikiFolder, updateWikiFolder, deleteWikiFolder, createWikiPage, updateWikiPage, deleteWikiPage } from "@/lib/actions/wiki";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, FileText, Plus, Trash, Edit2, Save, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen } from "lucide-react";

export function WikiView({ initialStructure, startupId }: { initialStructure: any, startupId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [structure, setStructure] = useState<{ folders: any[]; pages: any[] }>(initialStructure);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateFolder = async () => {
    const name = prompt("Folder name:");
    if (!name) return;
    try {
      await createWikiFolder({ name }, startupId);
      toast.success("Folder created");
      const data = await getWikiStructure(startupId);
      setStructure(data);
    } catch (e) {
      toast.error("Failed to create folder");
    }
  };

  const handleCreatePage = async () => {
    const title = prompt("Page title:");
    if (!title) return;
    try {
      const page = await createWikiPage({ title, content: "# New Page\\nStart writing...", folderId: undefined }, startupId);
      setActivePageId(page.id);
      toast.success("Page created");
      const data = await getWikiStructure(startupId);
      setStructure(data);
    } catch (e) {
      toast.error("Failed to create page");
    }
  };

  const selectPage = (id: string) => {
    setActivePageId(id);
    const page = structure.pages.find(p => p.id === id);
    if (page) {
      setEditTitle(page.title);
      setEditContent(page.content);
      setIsEditing(false);
    }
  };

  const savePage = async () => {
    if (!activePageId) return;
    try {
      await updateWikiPage(activePageId, { title: editTitle, content: editContent });
      toast.success("Page saved");
      setIsEditing(false);
      const data = await getWikiStructure(startupId);
      setStructure(data);
    } catch (e) {
      toast.error("Failed to save page");
    }
  };

  const activePage = structure.pages.find(p => p.id === activePageId);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      <aside className="w-64 border rounded-xl flex flex-col bg-muted/20">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Knowledge Base</h3>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCreateFolder} title="New Folder">
              <Folder className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCreatePage} title="New Page">
              <FileText className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {structure.folders.map(folder => (
              <div key={folder.id} className="mb-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Folder className="h-3 w-3" /> {folder.name}
                </div>
                <div className="ml-4 space-y-1 mt-1">
                  {structure.pages.filter(p => p.folderId === folder.id).map(page => (
                    <Button
                      key={page.id}
                      variant={activePageId === page.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm h-8 px-2"
                      onClick={() => selectPage(page.id)}
                    >
                      <FileText className="h-3 w-3 mr-2 opacity-50" /> {page.title}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-4">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Unsorted</div>
              <div className="space-y-1">
                {structure.pages.filter(p => !p.folderId).map(page => (
                  <Button
                    key={page.id}
                    variant={activePageId === page.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm h-8 px-2"
                    onClick={() => selectPage(page.id)}
                  >
                    <FileText className="h-3 w-3 mr-2 opacity-50" /> {page.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 border rounded-xl bg-background overflow-hidden flex flex-col">
        {activePage ? (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-muted/10">
              {isEditing ? (
                <div className="flex items-center gap-3 flex-1">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="max-w-md font-bold text-lg h-8"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
                    <Button size="sm" onClick={savePage} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-2xl font-bold">{activePage.title}</h2>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setEditTitle(activePage.title);
                    setEditContent(activePage.content);
                    setIsEditing(true);
                  }}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 p-8">
              {isEditing ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-[calc(100vh-300px)] font-mono text-sm p-4"
                  placeholder="Write your vision, research, or pitch here in Markdown..."
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{activePage.content}</ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <BookOpen className="h-12 w-12 opacity-20" />
            <p>Select a page from the sidebar to start reading or creating.</p>
          </div>
        )}
      </main>
    </div>
  );
}
