"use client";

import React, { useState } from "react";
import { getWikiStructure, createWikiFolder, createWikiPage, updateWikiPage } from "@/lib/actions/wiki";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, FileText, Edit2, Save, X, Menu, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { PageSidebar } from "@/components/ui/page-sidebar";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function FolderSidebar({ structure, activePageId, onSelect, onCreateFolder, onCreatePage }: {
  structure: { folders: any[]; pages: any[] };
  activePageId: string | null;
  onSelect: (id: string) => void;
  onCreateFolder: () => void;
  onCreatePage: () => void;
}) {
  const renderPage = (page: any) => (
    <Button
      key={page.id}
      variant={activePageId === page.id ? "secondary" : "ghost"}
      className="w-full justify-start text-sm h-8 px-2"
      onClick={() => onSelect(page.id)}
    >
      <FileText className="h-3 w-3 mr-2 opacity-50" /> {page.title}
    </Button>
  );

  return (
    <>
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Folders</h3>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCreateFolder} title="New folder">
            <Folder className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCreatePage} title="New page">
            <FileText className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="p-2 space-y-4 overflow-y-auto">
        {structure.folders.map((folder) => (
          <div key={folder.id}>
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
              <Folder className="h-3 w-3" /> {folder.name}
            </div>
            <div className="ml-4 space-y-1 mt-1">
              {structure.pages.filter((p) => p.folderId === folder.id).map(renderPage)}
            </div>
          </div>
        ))}
        <div>
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground mb-1">Unsorted</div>
          <div className="space-y-1">
            {structure.pages.filter((p) => !p.folderId).map(renderPage)}
          </div>
        </div>
      </div>
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
  const [createKind, setCreateKind] = useState<"folder" | "page" | null>(null);
  const [createName, setCreateName] = useState("");

  const refreshStructure = async () => {
    const data = await getWikiStructure();
    setStructure(data);
  };

  const handleCreate = async () => {
    const name = createName.trim();
    if (!name || !createKind) return;
    try {
      if (createKind === "folder") {
        await createWikiFolder({ name });
        toast.success("Folder created");
      } else {
        const page = await createWikiPage({ title: name, content: "# " + name + "\nStart writing…", folderId: undefined });
        setActivePageId(page.id);
        toast.success("Page created");
      }
      await refreshStructure();
      setCreateKind(null);
      setCreateName("");
    } catch {
      toast.error("Could not create " + createKind);
    }
  };

  const selectPage = (id: string) => {
    setActivePageId(id);
    const page = structure.pages.find((p) => p.id === id);
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
      await refreshStructure();
    } catch {
      toast.error("Could not save page");
    }
  };

  const activePage = structure.pages.find((p) => p.id === activePageId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1">
          Your team&apos;s living memory — SOPs, research, pitches, and decisions.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <aside className="hidden md:flex w-64 shrink-0 flex-col rounded-xl border bg-card">
          <FolderSidebar
            structure={structure}
            activePageId={activePageId}
            onSelect={selectPage}
            onCreateFolder={() => setCreateKind("folder")}
            onCreatePage={() => setCreateKind("page")}
          />
        </aside>

        <PageSidebar label="Folders" open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <div className="flex w-64 flex-col">
            <FolderSidebar
              structure={structure}
              activePageId={activePageId}
              onSelect={(id) => { selectPage(id); setSidebarOpen(false); }}
              onCreateFolder={() => setCreateKind("folder")}
              onCreatePage={() => setCreateKind("page")}
            />
          </div>
        </PageSidebar>

        <main className="flex-1 min-w-0 rounded-xl border bg-card">
          {activePage ? (
            <>
              <div className="p-4 border-b flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <button onClick={() => setSidebarOpen(true)} aria-label="Open folders"
                    className="md:hidden shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Menu className="h-4 w-4" />
                  </button>
                  {isEditing ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="max-w-md font-semibold h-8"
                    />
                  ) : (
                    <h2 className="text-xl font-semibold truncate">{activePage.title}</h2>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
                      <Button size="sm" onClick={savePage} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditTitle(activePage.title);
                      setEditContent(activePage.content);
                      setIsEditing(true);
                    }}>
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[50vh] font-mono text-sm p-4 rounded-none border-0"
                  placeholder="Write it in Markdown…"
                />
              ) : (
                <div className="p-6 prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{activePage.content}</ReactMarkdown>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
              <BookOpen className="h-10 w-10 opacity-20" />
              <p className="text-sm">Select a page from the sidebar, or create a new one.</p>
            </div>
          )}
        </main>
      </div>

      <Dialog open={createKind !== null} onOpenChange={(o) => { if (!o) setCreateKind(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createKind === "folder" ? "New folder" : "New page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="create-name">
              {createKind === "folder" ? "Folder name" : "Page title"}
            </Label>
            <Input
              id="create-name"
              autoFocus
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder={createKind === "folder" ? "e.g. Sales playbook" : "e.g. Investor update template"}
            />
          </div>
          <DialogFooter>
            <Button size="sm" variant="ghost" onClick={() => setCreateKind(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={!createName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}