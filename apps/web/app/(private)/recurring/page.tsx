
import Recurring from "@/screens/private/Recurring";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Recurring Transactions",
  description: "Review and manage recurring income and expenses.",
  path: "/recurring",
  noIndex: true,
});

export default function RecurringPage() {
  return <Recurring />;
}
