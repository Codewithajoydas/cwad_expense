import LandingPage from "@/screens/public/LandingPage";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Personal Finance, Made Clear",
  description:
    "Bring your accounts, transactions, budgets, and savings goals together with CWAD Expense.",
  path: "/",
});

export default function HomePage() {
  return <LandingPage />;
}
