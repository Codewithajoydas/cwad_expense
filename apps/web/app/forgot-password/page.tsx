import ForgotPassword from "@/screens/auth/Forgot-password";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Forgot Password",
  description: "Request a password reset for your CWAD Expense account.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
