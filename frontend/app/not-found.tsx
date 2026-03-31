"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="relative">
        <h1 className="text-[12rem] font-bold leading-none tracking-tight text-primary/40 select-none">
          404
        </h1>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Page Not Found
        </h2>
        <p className="text-muted-foreground max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button onClick={() => router.push("/")}>
          <Home className="mr-2 h-4 w-4" />
          Go to Home
        </Button>
      </div>
    </div>
  );
}
