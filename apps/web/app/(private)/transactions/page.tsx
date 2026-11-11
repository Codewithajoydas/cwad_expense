
import Transactions from "@/screens/private/Transactions";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Transactions",
  description: "Review and manage your recorded income and expenses.",
  path: "/transactions",
  noIndex: true,
});

export default function TransactionsPage() {
  return <Transactions />;
}
