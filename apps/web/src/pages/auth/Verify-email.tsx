
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Mail, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token");

  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const handleResendEmail = async () => {
    setError("");
    setMessage("");
    setIsResending(true);

    try {
      // TODO: Connect your backend resend-verification API.
      // Example:
      // await api.post("/auth/resend-verification", { email });

      setError("Email verification API is not connected yet.");
    } catch {
      setError("Unable to resend the verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!token) {
      setError("The verification link is missing or invalid.");
      return;
    }

    setError("");
    setMessage("");

    try {
      // TODO: Connect your backend verification API.
      // Example:
      // await api.post("/auth/verify-email", { token });

      setError("Email verification API is not connected yet.");
    } catch {
      setError("Verification failed. The link may have expired.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm sm:p-8">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>

        <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {isVerified ? (
            <CheckCircle2 className="size-6" />
          ) : (
            <Mail className="size-6" />
          )}
        </div>

        {isVerified ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              Email verified
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your email has been verified successfully. You can now
              sign in to your CWAD Expense account.
            </p>

            <Button  className="mt-6 w-full">
              <Link to="/login">Continue to login</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify your email
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We need to verify your email address before you can
              continue using your CWAD Expense account.
            </p>

            {email ? (
              <div className="mt-5 rounded-md border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Verification email sent to
                </p>
                <p className="mt-1 break-all text-sm font-medium">
                  {email}
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">
                Open the verification link sent to your registered email
                address.
              </p>
            )}

            {token && (
              <Button
                type="button"
                className="mt-5 w-full"
                onClick={handleVerifyEmail}
              >
                Verify email address
              </Button>
            )}

            {message && (
              <p role="status" className="mt-4 text-sm text-green-600">
                {message}
              </p>
            )}

            {error && (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-6 border-t pt-5">
              <p className="text-sm text-muted-foreground">
                Didn't receive the verification email?
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full"
                onClick={handleResendEmail}
                disabled={isResending || !email}
              >
                <RefreshCw
                  className={`mr-2 size-4 ${isResending ? "animate-spin" : ""}`}
                />
                {isResending ? "Sending..." : "Resend verification email"}
              </Button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          CWAD Expense · Personal Finance Manager
        </p>
      </div>
    </main>
  );
}
