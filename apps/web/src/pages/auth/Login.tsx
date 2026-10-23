
import { useState } from "react";
import { Link } from "react-router";
import {
  Eye,
  EyeOff,
  Wallet,
  ArrowRight,
} from "lucide-react";

import logo from "@/assets/images/cwad-expense-logo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left: Login Form */}
      <section className="flex min-h-screen flex-col">
        {/* Logo */}
        <header className="flex items-center px-6 py-5 sm:px-10">
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

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl border bg-muted/50">
                <Wallet className="size-6" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to manage your money and track your finances.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                // Connect your login API here.
              }}
            >
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
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pr-10"
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
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked === true)
                  }
                />

                <label
                  htmlFor="remember"
                  className="cursor-pointer text-sm text-muted-foreground"
                >
                  Remember me
                </label>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full">
                Sign in
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                SECURE ACCESS
              </span>
              <Separator className="flex-1" />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-5 text-center text-xs text-muted-foreground sm:px-10">
          © {new Date().getFullYear()} CWAD Expense. All rights reserved.
        </footer>
      </section>

      {/* Right: Unsplash Image */}
      <section className="relative hidden overflow-hidden bg-muted lg:block">
        <img
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=85"
          alt="Financial analytics displayed on a workspace"
          className="absolute inset-0 size-full object-cover"
        />

        <div className="absolute inset-0 bg-slate-950/55" />

        <div className="relative flex h-full min-h-screen flex-col justify-between p-12 text-white xl:p-16">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur">
              <Wallet className="size-5" />
            </div>

            <span className="text-sm font-medium">
              Your money, organized.
            </span>
          </div>

          <div className="max-w-lg">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
              Take control of your finances
            </p>

            <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Make better financial decisions, every day.
            </h2>

            <p className="mt-5 max-w-md text-base leading-7 text-white/75">
              Track your income, manage expenses, set budgets, and
              build better money habits with CWAD Expense.
            </p>
          </div>

          <p className="text-xs text-white/60">
            A clearer picture of your finances starts here.
          </p>
        </div>
      </section>
    </main>
  );
}
