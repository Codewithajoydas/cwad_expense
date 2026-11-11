import Dashboard from "@/screens/private/Dashboard";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Dashboard",
  description: "Review your financial activity and key account balances.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardPage() {
  return <Dashboard />;
}
