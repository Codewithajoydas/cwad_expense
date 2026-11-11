import Accounts from "@/screens/private/Accounts";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Accounts",
  description: "View and manage the financial accounts tracked in CWAD Expense.",
  path: "/accounts",
  noIndex: true,
});

export default function AccountsPage() {
  return <Accounts />;
}
