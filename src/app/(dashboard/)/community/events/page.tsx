"use client";

import React, { useState, useEffect } from "react";
import { getCommunityEvents, rsvpToEvent, createCommunityEvent } from "@/app/actions/community";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, MapPin, Video } from "lucide-react";
import { ConversionGuard } from "@/components/community/conversion-guard";

export default function EventsPage() {
  return (
    <ConversionGuard featureName="Community Events">
      <EventsContent />
    </ConversionGuard>
  );
}

function EventsContent() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    location: "",
    type: "Online",
    capacity: "",
  });

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const data = await getCommunityEvents({});
        setEvents(data);
      } catch (e) {
        toast.error("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  async function handleRSVP(eventId: string, status: "GOING" | "MAYBE") {
    try {
      await rsvpToEvent(eventId, status);
      toast.success(`Marked as ${status}!`);
      // Refresh events to update RSVP status
      const data = await getCommunityEvents({});
      setEvents(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to RSVP");
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await createCommunityEvent({
        ...formData,
        date: formData.date,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      });
      toast.success("Event created successfully!");
      setIsModalOpen(false);
      setFormData({ title: "", description: "", date: new Date(), location: "", type: "Online", capacity: "" });
      const data = await getCommunityEvents({});
      setEvents(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Events</h1>
          <p className="text-muted-foreground">Connect with other founders online and in-person.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Organize Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Community Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.date.toISOString().slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="w-full rounded-md border p-2 text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location (URL or Address)</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Capacity (optional)</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="p-4 bg-muted/30">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date || new Date())}
              className="rounded-md"
            />
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 w-full bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No upcoming events. Be the first to organize one!
            </div>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={event.type === "Online" ? "secondary" : "outline"}>
                        {event.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Organized by {event.organizer.name}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleRSVP(event.id, "MAYBE")}>
                      Maybe
                    </Button>
                    <Button size="sm" onClick={() => handleRSVP(event.id, "GOING")}>
                      I'm Going
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {event.type === "Online" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleString()}
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{event.description}</p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
