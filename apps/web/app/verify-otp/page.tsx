
import { Suspense } from "react";
import VerifyOtp from "@/screens/auth/Verify-otp";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Verify One-Time Code",
  description: "Enter your verification code to continue to CWAD Expense.",
  path: "/verify-otp",
  noIndex: true,
});

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtp />
    </Suspense>
  );
}
