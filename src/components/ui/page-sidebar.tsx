"use client";

import { type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function PageSidebar({
  label,
  open,
  onOpenChange,
  children,
}: {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        overlayClassName="md:hidden"
        className="p-4 md:hidden"
        showCloseButton={false}
      >
        <SheetTitle className="sr-only">{label}</SheetTitle>
        <div className="flex h-full flex-col">{children}</div>
      </SheetContent>
    </Sheet>
  );
}