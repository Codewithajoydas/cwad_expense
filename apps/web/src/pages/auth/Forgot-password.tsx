
import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: Connect your backend password-reset API here.
      // Example:
      // await api.post("/auth/forgot-password", { email });

      setError("Password reset API is not connected yet.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
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
          <Mail className="size-6" />
        </div>

        {isSubmitted ? (
          <>
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle2 className="size-6" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Check your email
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              If an account exists for {email}, you will receive
              instructions to reset your password.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-6 w-full"
              onClick={() => {
                setIsSubmitted(false);
                setError("");
              }}
            >
              Try another email
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              Forgot password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              No worries. Enter the email address associated with
              your account and we will send you password reset
              instructions.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send reset instructions"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
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
