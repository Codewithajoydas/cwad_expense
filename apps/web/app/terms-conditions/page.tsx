
import TermsAndConditions from "@/screens/public/TermsAndConditions";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Terms and Conditions",
  description: "Review the terms for using the CWAD Expense personal finance application.",
  path: "/terms-conditions",
});

export default function TermsAndConditionsPage() {
  return <TermsAndConditions />;
}
