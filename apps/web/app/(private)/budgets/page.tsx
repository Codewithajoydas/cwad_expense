
import Budgets from "@/screens/private/Budgets";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Budgets",
  description: "Create and track budgets for your personal finances.",
  path: "/budgets",
  noIndex: true,
});

export default function BudgetsPage() {
  return <Budgets />;
}
