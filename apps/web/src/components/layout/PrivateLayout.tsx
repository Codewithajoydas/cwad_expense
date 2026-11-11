"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import SessionSkeleton from "@/components/layout/SessionSkeleton";
import Sidebar from "@/components/layout/Sidebar";
import { authClient } from "@/lib/auth-client";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, error, isPending } = authClient.useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isPending && !error && !session) {
      router.replace("/login");
    }
  }, [error, isPending, router, session]);

  if (isPending || (!session && !error)) {
    return <SessionSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h2 className="text-xl font-semibold">Unable to verify your session</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Please check your connection and try again.
        </p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((open) => !open)}
      />
      <main
        className={`min-h-screen min-w-0 transition-all duration-200 ${
          isSidebarOpen ? "md:pl-64" : "pl-0"
        }`}
      >
        <Header onMenuClick={() => setIsSidebarOpen((open) => !open)} />
        {children}
      </main>
    </div>
  );
}
