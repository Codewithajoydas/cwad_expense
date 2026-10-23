
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  Wallet,
  ArrowRight,
  UserRound,
  Check,
} from "lucide-react";

import logo from "@/assets/images/cwad-expense-logo.png";

import { authClient } from "../../lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim();
      const { error: signupError } =
        await authClient.signUp.email({
          name: name.trim(),
          email: normalizedEmail,
          password,
          callbackURL: `${window.location.origin}/verify-email?verified=1`,
        });

      if (signupError) {
        setError(
          signupError.message || "Unable to create your account.",
        );
        return;
      }

      navigate(
        `/verify-email?email=${encodeURIComponent(normalizedEmail)}`,
        { replace: true },
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left: Signup Form */}
      <section className="flex min-h-screen flex-col">
        {/* Brand */}
        <header className="shrink-0 px-6 py-5 sm:px-10">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="CWAD Expense"
              className="size-9 object-contain"
            />

            <div>
              <p className="text-sm font-semibold tracking-tight">
                CWAD Expense
              </p>
              <p className="text-xs text-muted-foreground">
                Personal finance manager
              </p>
            </div>
          </Link>
        </header>

        {/* Form Content */}
        <div className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl border bg-muted/50">
                <UserRound className="size-5" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Start managing your income, expenses, and financial
                goals in one place.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium"
                >
                  Full name
                </label>

                <Input
                  id="fullName"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email address
                </label>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={8}
                    className="pr-10"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Use at least 8 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    minLength={8}
                    className="pr-10"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) =>
                    setAcceptedTerms(checked === true)
                  }
                  className="mt-0.5"
                />

                <label
                  htmlFor="terms"
                  className="cursor-pointer text-sm leading-5 text-muted-foreground"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms-conditions"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !acceptedTerms}
              >
                {loading ? "Creating account..." : "Create account"}

                {!loading && (
                  <ArrowRight className="ml-2 size-4" />
                )}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-4">
              <Separator className="flex-1" />

              <span className="text-xs text-muted-foreground">
                ALREADY REGISTERED?
              </span>

              <Separator className="flex-1" />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-5 text-center text-xs text-muted-foreground sm:px-10">
          © {new Date().getFullYear()} CWAD Expense. All rights
          reserved.
        </footer>
      </section>

      {/* Right: Background */}
      <section className="relative hidden overflow-hidden bg-muted lg:block">
        <img
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=85"
          alt="Financial analytics on a workspace"
          className="absolute inset-0 size-full object-cover"
        />

        <div className="absolute inset-0 bg-slate-950/55" />

        <div className="relative flex min-h-screen flex-col justify-between p-12 text-white xl:p-16">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-white/20 bg-white/10">
              <Wallet className="size-5" />
            </div>

            <span className="text-sm font-medium">
              CWAD Expense
            </span>
          </div>

          <div className="max-w-lg">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
              Build better money habits
            </p>

            <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Your financial journey starts here.
            </h2>

            <p className="mt-5 max-w-md text-base leading-7 text-white/75">
              Organize your transactions, stay within budget, and
              work toward your financial goals with confidence.
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm text-white/80">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
                <Check className="size-4" />
              </span>
              <span>Track income and expenses</span>
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm text-white/80">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
                <Check className="size-4" />
              </span>
              <span>Plan budgets and savings goals</span>
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm text-white/80">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
                <Check className="size-4" />
              </span>
              <span>Understand your spending habits</span>
            </div>
          </div>

          <p className="text-xs text-white/60">
            Simple tools for smarter financial decisions.
          </p>
        </div>
      </section>
    </main>
  );
}
