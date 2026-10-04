"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Zap } from "lucide-react";

interface ConversionGuardProps {
  children: React.ReactNode;
  featureName: string;
}

export function ConversionGuard({ children, featureName }: ConversionGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState(false);
  const router = useRouter();

  async function checkAuth() {
    try {
      const response = await fetch("/api/user/subscription");
      const data = await response.json();
      setIsAuthorized(data.status === "active");
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  if (error) {
    return (
      <Card className="p-8 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
        <p className="text-sm text-muted-foreground">
          Could not verify your subscription. Check your connection.
        </p>
        <Button variant="outline" size="sm" onClick={checkAuth}>
          Retry
        </Button>
      </Card>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="space-y-3" aria-hidden>
        <div className="h-24 w-full bg-muted animate-pulse rounded-xl" />
        <div className="h-24 w-full bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <Card className="p-8 text-center flex flex-col items-center justify-center gap-6 max-w-md mx-auto border-primary/20 bg-primary/5">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{featureName} is a Pro Feature</h2>
          <p className="text-muted-foreground text-sm">
            Join the private founder community to unlock {featureName.toLowerCase()}, direct support, and AI coaching.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Button className="gap-2" onClick={() => router.push("/billing")}>
            <Zap className="h-4 w-4" /> Upgrade to Pro
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}
