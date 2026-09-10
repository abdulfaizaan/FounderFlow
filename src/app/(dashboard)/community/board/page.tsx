"use client";

import React, { useState, useEffect } from "react";
import { getJobListings, getCoFounderPosts, createJobListing, createCoFounderPost } from "@/app/actions/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Briefcase, Users, Plus, ExternalLink } from "lucide-react";
import { ConversionGuard } from "@/components/community/conversion-guard";
import { cn } from "@/lib/utils";

export default function BoardPage() {
  return (
    <ConversionGuard featureName="Opportunity Board">
      <BoardContent />
    </ConversionGuard>
  );
}

function BoardContent() {
  const [tab, setTab] = useState<"jobs" | "cofounders">("jobs");
  const [jobs, setJobs] = useState<any[]>([]);
  const [cofounders, setCofounders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    type: "Full-time",
    url: "",
    skillsNeeded: "",
    skillsOffered: "",
    locationPreference: "",
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [jobsData, cofoundersData] = await Promise.all([
          getJobListings({}),
          getCoFounderPosts({}),
        ]);
        setJobs(jobsData);
        setCofounders(cofoundersData);
      } catch (e) {
        toast.error("Failed to load board data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      if (tab === "jobs") {
        await createJobListing({
          title: formData.title,
          company: formData.company,
          description: formData.description,
          location: formData.location,
          type: formData.type,
          url: formData.url,
        });
      } else {
        await createCoFounderPost({
          title: formData.title,
          description: formData.description,
          skillsNeeded: formData.skillsNeeded.split(",").map(s => s.trim()),
          skillsOffered: formData.skillsOffered.split(",").map(s => s.trim()),
          locationPreference: formData.locationPreference,
        });
      }
      toast.success("Post created successfully!");
      setIsModalOpen(false);
      setFormData({ title: "", company: "", description: "", location: "", type: "Full-time", url: "", skillsNeeded: "", skillsOffered: "", locationPreference: "" });
      // Refresh
      const [jobsData, cofoundersData] = await Promise.all([getJobListings({}), getCoFounderPosts({})]);
      setJobs(jobsData);
      setCofounders(cofoundersData);
    } catch (e: any) {
      toast.error(e.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunity Board</h1>
          <p className="text-muted-foreground">Find talent or a partner for your journey.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Post {tab === "jobs" ? "Job" : "Search"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{tab === "jobs" ? "Post a Job Opening" : "Search for a Co-founder"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                {tab === "jobs" ? (
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Location Preference</Label>
                    <Input
                      value={formData.locationPreference}
                      onChange={(e) => setFormData({ ...formData, locationPreference: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {tab === "jobs" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full rounded-md border p-2 text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Equity">Equity Only</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Skills Needed (comma separated)</Label>
                    <Input
                      value={formData.skillsNeeded}
                      onChange={(e) => setFormData({ ...formData, skillsNeeded: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Skills Offered (comma separated)</Label>
                    <Input
                      value={formData.skillsOffered}
                      onChange={(e) => setFormData({ ...formData, skillsOffered: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[150px]"
                />
              </div>

              {tab === "jobs" && (
                <div className="space-y-2">
                  <Label>Application URL</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              )}

              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post to Board"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={tab === "jobs" ? "secondary" : "ghost"}
          className={cn("gap-2", tab === "jobs" && "shadow-sm")}
          onClick={() => setTab("jobs")}
        >
          <Briefcase className="h-4 w-4" /> Jobs
        </Button>
        <Button
          variant={tab === "cofounders" ? "secondary" : "ghost"}
          className={cn("gap-2", tab === "cofounders" && "shadow-sm")}
          onClick={() => setTab("cofounders")}
        >
          <Users className="h-4 w-4" /> Co-founders
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 w-full bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tab === "jobs" ? (
            jobs.map((job) => (
              <Card key={job.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">{job.company}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{job.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-muted-foreground">Posted by {job.founder.name}</span>
                  <a href={job.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Apply <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Card>
            ))
          ) : (
            cofounders.map((post) => (
              <Card key={post.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    <Badge variant="outline">{post.locationPreference || "Remote"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.description}</p>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Skills Needed</span>
                      <div className="flex flex-wrap gap-1">
                        {post.skillsNeeded.map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Skills Offered</span>
                      <div className="flex flex-wrap gap-1">
                        {post.skillsOffered.map((s: string) => (
                          <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Posted by {post.founder.name}</span>
                  <Button size="sm" variant="ghost" className="h-8 text-xs">Connect</Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
