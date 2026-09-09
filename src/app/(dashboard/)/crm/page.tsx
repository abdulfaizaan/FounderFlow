"use client";

import React, { useState, useEffect } from "react";
import { getLeads, createLead, updateLeadStatus, deleteLead } from "@/lib/actions/crm";
import { getActiveStartupIdForUser } from "@/lib/startup-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserPlus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";

const STATUSES = ["Lead", "Tester", "Customer"];

export default function CRMPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", status: "Lead", notes: "" });

  useEffect(() => {
    async function loadLeads() {
      setIsLoading(true);
      try {
        const ctx = await getActiveStartupIdForUser(null as any);
        if (ctx) {
          const data = await getLeads(ctx.startupId);
          setLeads(data);
        }
      } catch (e) {
        toast.error("Failed to load leads");
      } finally {
        setIsLoading(false);
      }
    }
    loadLeads();
  }, []);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const ctx = await getActiveStartupIdForUser(null as any);
      if (!ctx) throw new Error("No active startup found");

      await createLead(formData, ctx.startupId);
      toast.success("Lead added!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", status: "Lead", notes: "" });
      const data = await getLeads(ctx.startupId);
      setLeads(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to add lead");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMove(id: string, direction: "next" | "prev", currentStatus: string) {
    const currentIndex = STATUSES.indexOf(currentStatus);
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= STATUSES.length) return;

    try {
      await updateLeadStatus(id, STATUSES[nextIndex]);
      toast.success(`Moved to ${STATUSES[nextIndex]}`);
      const ctx = await getActiveStartupIdForUser(null as any);
      if (ctx) {
        const data = await getLeads(ctx.startupId);
        setLeads(data);
      }
    } catch (e: any) {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteLead(id);
      toast.success("Lead deleted");
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (e: any) {
      toast.error("Failed to delete lead");
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading CRM...</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Early-Adopter CRM</h1>
          <p className="text-muted-foreground">Track your first users from lead to customer.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" /> Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Initial Status</Label>
                <select
                  className="w-full rounded-md border p-2 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Lead"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUSES.map(status => (
          <div key={status} className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-semibold flex items-center gap-2">
                {status}
                <Badge variant="secondary">{leads.filter(l => l.status === status).length}</Badge>
              </h3>
            </div>
            <div className="flex flex-col gap-3 min-h-[500px] bg-muted/30 p-3 rounded-xl border border-dashed">
              {leads.filter(l => l.status === status).map(lead => (
                <Card key={lead.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{lead.name}</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(lead.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{lead.email}</p>
                  <p className="text-sm mb-4 line-clamp-3">{lead.notes}</p>
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={status === STATUSES[0]}
                      onClick={() => handleMove(lead.id, "prev", status)}
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" /> Prev
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={status === STATUSES[STATUSES.length - 1]}
                      onClick={() => handleMove(lead.id, "next", status)}
                    >
                      Next <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
