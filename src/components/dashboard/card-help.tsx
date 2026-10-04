"use client";

import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

/** Small "?" button that explains the card it sits on. */
export function CardHelp({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`About ${title}`}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm">
        <p className="mb-1 font-medium">{title}</p>
        <p className="text-muted-foreground">{children}</p>
      </PopoverContent>
    </Popover>
  );
}