
import Signup from "@/screens/auth/Signup";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Create an Account",
  description: "Create a CWAD Expense account to organize your personal finances.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <Signup />;
}
