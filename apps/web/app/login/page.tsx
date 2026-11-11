
import Login from "@/screens/auth/Login";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Log In",
  description: "Log in to your CWAD Expense account to manage your finances.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <Login />;
}
