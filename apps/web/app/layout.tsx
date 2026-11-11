import type { Metadata } from "next";
import AppProviders from "@/components/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cwad-expense.codewithajoydas.in"),
  title: {
    default: "CWAD Expense",
    template: "%s | CWAD Expense",
  },
  description:
    "Organize your accounts, transactions, budgets, and financial goals with CWAD Expense.",
  applicationName: "CWAD Expense",
  openGraph: {
    type: "website",
    siteName: "CWAD Expense",
    title: "CWAD Expense",
    description:
      "Organize your accounts, transactions, budgets, and financial goals with CWAD Expense.",
    url: "/",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CWAD Expense",
    description:
      "Organize your accounts, transactions, budgets, and financial goals with CWAD Expense.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
