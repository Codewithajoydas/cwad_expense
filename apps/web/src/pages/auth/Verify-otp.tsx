
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value: string) => {
    setOtp(value.replace(/\D/g, "").slice(0, 6));
    setError("");
  };

  const handleVerify = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setIsVerifying(true);

    try {
      // TODO: Connect your backend OTP verification API.
      // Example:
      // await api.post("/auth/verify-otp", { email, otp });

      setError("OTP verification API is not connected yet.");
    } catch {
      setError("Verification failed. Please check your OTP and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Email address is missing. Please return and try again.");
      return;
    }

    setError("");
    setMessage("");
    setIsResending(true);

    try {
      // TODO: Connect your backend resend OTP API.
      // Example:
      // await api.post("/auth/resend-otp", { email });

      setError("Resend OTP API is not connected yet.");
    } catch {
      setError("Unable to resend OTP. Please try again.");
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
          <ShieldCheck className="size-6" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Verify your email
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter the 6-digit verification code sent to your email address.
        </p>

        {email && (
          <p className="mt-3 break-all text-sm font-medium">
            {email}
          </p>
        )}

        <form onSubmit={handleVerify} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="otp"
              className="text-sm font-medium"
            >
              Verification code
            </label>

            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(event) => handleOtpChange(event.target.value)}
              maxLength={6}
              className="h-12 text-center text-lg tracking-[0.5em]"
              aria-describedby={error ? "otp-error" : undefined}
              required
            />

            <p className="text-xs text-muted-foreground">
              The code must contain 6 digits.
            </p>
          </div>

          {error && (
            <p id="otp-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="text-sm text-green-600">
              {message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        <div className="mt-6 border-t pt-5 text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>

          {countdown > 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Resend available in {countdown}s
            </p>
          ) : (
            <Button
              type="button"
              variant="link"
              onClick={async () => {
                await handleResendOtp();
                setCountdown(30);
              }}
              disabled={isResending || !email}
              className="mt-1"
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </Button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          CWAD Expense · Personal Finance Manager
        </p>
      </div>
    </main>
  );
}
