
import { Suspense } from "react";
import VerifyEmail from "@/screens/auth/Verify-email";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Verify Email",
  description: "Verify the email address associated with your CWAD Expense account.",
  path: "/verify-email",
  noIndex: true,
});

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
