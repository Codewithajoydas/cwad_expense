
import Debts from "@/screens/private/Debts";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Debts",
  description: "Track money you owe and money owed to you.",
  path: "/debts",
  noIndex: true,
});

export default function DebtsPage() {
  return <Debts />;
}
