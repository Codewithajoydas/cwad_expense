import type { ReactNode } from "react";
import PrivateLayout from "@/components/layout/PrivateLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:{
    default: "CWAD Expense",
    template: "%s | CWAD Expense",
  },
  description: "Personal finance management app for personal use.",
  applicationName: "CWAD Expense",
  authors: [
    {
      name: "Ajoy Das",
      url: "https://codewithajoydas.in/about",
    },
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    siteName: "CWAD Expense",
    title: "CWAD Expense",
    description: "Personal finance management app for personal use.",
    url: "https://cwad-expense.codewithajoydas.in/",
    images: ["/og-image.png"],
  },

  twitter: {
    card: "summary_large_image",
    title: "CodeWithAjoyDas",
    description: "Explore my developer portfolio.",
    images: ["/og-image.png"],
  },
};

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
