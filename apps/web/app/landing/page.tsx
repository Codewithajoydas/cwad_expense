
import LandingPage from "@/screens/public/LandingPage";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Personal Finance Management",
  description:
    "Explore CWAD Expense tools for tracking transactions, managing budgets, and planning financial goals.",
  path: "/landing",
});

export default function LandingRoute() {
  return <LandingPage />;
}
