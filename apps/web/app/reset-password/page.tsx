
import { Suspense } from "react";
import ResetPassword from "@/screens/auth/Reset-password";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Reset Password",
  description: "Choose a new password for your CWAD Expense account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
