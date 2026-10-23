
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Mail,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const verificationComplete = searchParams.get("verified") === "1";
  const verificationError = searchParams.get("error");

  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(verificationComplete);

  useEffect(() => {
    if (verificationComplete) {
      setIsVerified(true);
      setMessage("Your email has been verified successfully.");
      setError("");
    } else if (verificationError) {
      setError(
        verificationError === "invalid_token"
          ? "This verification link is invalid. Request a new email to try again."
          : verificationError === "token_expired"
            ? "This verification link has expired. Request a new one."
            : "Email verification failed. Please try again or request a new link.",
      );
    }
  }, [verificationComplete, verificationError]);

  const handleResendEmail = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Please return to login and enter your email address first.");
      return;
    }

    setError("");
    setMessage("");
    setIsResending(true);

    try {
      const { error: resendError } =
        await authClient.sendVerificationEmail({
          email: normalizedEmail,
          callbackURL: `${window.location.origin}/verify-email?verified=1`,
        });

      if (resendError) {
        setError(
          resendError.message ||
            "Unable to resend the verification email. Please try again.",
        );
        return;
      }

      setMessage(
        "If this account needs verification, a verification email has been requested. Check your inbox and spam folder.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend the verification email. Please try again.",
      );
    } finally {
      setIsResending(false);
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

            {message && (
              <p
                role="status"
                className="mt-4 text-sm text-green-600"
              >
                {message}
              </p>
            )}

            <Button asChild className="mt-6 w-full">
              <Link to="/login">Continue to login</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify your email
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Verify your email address before signing in to your
              CWAD Expense account.
            </p>

            {email ? (
              <div className="mt-5 rounded-md border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Verification email requested for
                </p>

                <p className="mt-1 break-all text-sm font-medium">
                  {email}
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">
                Open the verification link sent to your registered email
                address. If you need another email, return to login and
                enter your email address first.
              </p>
            )}

            {message && (
              <p
                role="status"
                className="mt-4 rounded-md border border-green-600/20 bg-green-600/5 px-3 py-2 text-sm text-green-700"
              >
                {message}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
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
                  className={`mr-2 size-4 ${
                    isResending ? "animate-spin" : ""
                  }`}
                />

                {isResending
                  ? "Sending..."
                  : "Resend verification email"}
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
