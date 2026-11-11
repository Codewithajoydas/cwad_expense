
import PrivacyPolicy from "@/screens/public/PrivacyPolicy";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "Learn how CWAD Expense handles personal information and financial data.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
