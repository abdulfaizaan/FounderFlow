"use client";

import React, { useState } from "react";
import { getWikiStructure, createWikiFolder, createWikiPage, updateWikiPage } from "@/lib/actions/wiki";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, FileText, Edit2, Save, X, Menu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen } from "lucide-react";
import { PageSidebar } from "@/components/ui/page-sidebar";

function FolderSidebar({ structure, activePageId, onSelect, onCreateFolder, onCreatePage }: {
  structure: { folders: any[]; pages: any[] };
  activePageId: string | null;
  onSelect: (id: string) => void;
  onCreateFolder: () => void;
  onCreatePage: () => void;
}) {
  return (
    <>
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Knowledge Base</h3>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCreateFolder} title="New Folder">
            <Folder className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCreatePage} title="New Page">
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
                    onClick={() => onSelect(page.id)}
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
                  onClick={() => onSelect(page.id)}
                >
                  <FileText className="h-3 w-3 mr-2 opacity-50" /> {page.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

export function WikiView({ initialStructure, startupId }: { initialStructure: any, startupId: string }) {
  const [structure, setStructure] = useState<{ folders: any[]; pages: any[] }>(initialStructure);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      const page = await createWikiPage({ title, content: "# New Page\nStart writing...", folderId: undefined }, startupId);
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
      <aside className="hidden md:flex w-64 border rounded-xl flex-col bg-muted/20">
        <FolderSidebar
          structure={structure}
          activePageId={activePageId}
          onSelect={selectPage}
          onCreateFolder={handleCreateFolder}
          onCreatePage={handleCreatePage}
        />
      </aside>

      <PageSidebar label="Folders" open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <FolderSidebar
          structure={structure}
          activePageId={activePageId}
          onCreateFolder={handleCreateFolder}
          onCreatePage={handleCreatePage}
          onSelect={(id) => { selectPage(id); setSidebarOpen(false); }}
        />
      </PageSidebar>

      <main className="flex-1 border rounded-xl bg-background overflow-hidden flex flex-col">
        {activePage ? (
          <>
            <div className="p-4 border-b flex items-center justify-between gap-2 bg-muted/10">
              <button onClick={() => setSidebarOpen(true)} aria-label="Open folders"
                className="md:hidden shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Menu className="h-4 w-4" />
              </button>
              {isEditing ? (
                <div className="flex items-center gap-3 flex-1 flex-wrap">
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
                <div className="flex items-center justify-between w-full gap-2">
                  <h2 className="text-2xl font-bold min-w-0 truncate">{activePage.title}</h2>
                  <Button size="sm" variant="ghost" className="shrink-0" onClick={() => {
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