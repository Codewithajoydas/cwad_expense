import CreateExpense from "@/screens/private/Create-expense";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Add Expense",
  description: "Record an expense and keep your budget up to date.",
  path: "/create-expense",
  noIndex: true,
});

export default function CreateExpensePage() {
  return <CreateExpense />;
}
