
import Reports from "@/screens/private/Reports";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Reports",
  description: "Explore reports and insights about your financial activity.",
  path: "/reports",
  noIndex: true,
});

export default function ReportsPage() {
  return <Reports />;
}
