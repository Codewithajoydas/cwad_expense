import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or may have moved.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    siteName: "CWAD Expense",
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or may have moved.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or may have moved.",
    images: ["/og-image.png"],
  },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-6xl font-semibold tracking-tight">404</h1>
      <h2 className="text-xl font-medium">Page not found</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-3 text-sm font-medium underline underline-offset-4"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
