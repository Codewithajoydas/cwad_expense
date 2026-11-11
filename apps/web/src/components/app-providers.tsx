"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppProviders({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
