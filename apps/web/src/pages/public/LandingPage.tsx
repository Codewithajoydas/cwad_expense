
import { Link } from "react-router";
import {
  ArrowRight,
  ArrowLeftRight,
  ChartNoAxesCombined,
  ShieldCheck,
  Target,
  Wallet,
  Receipt,
  PiggyBank,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import logo from "@/assets/images/cwad-expense-logo.png";

const features = [
  {
    icon: Receipt,
    title: "Track transactions",
    description:
      "Record income and expenses in one place and review your transaction history.",
  },
  {
    icon: Wallet,
    title: "Manage accounts",
    description:
      "Organize your accounts and keep an eye on your available balances.",
  },
  {
    icon: PiggyBank,
    title: "Plan budgets",
    description:
      "Set budgets for spending categories and compare your spending against them.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Understand your finances",
    description:
      "Review reports and summaries to better understand your financial habits.",
  },
  {
    icon: Target,
    title: "Set financial goals",
    description:
      "Track progress toward savings goals and other personal financial targets.",
  },
  {
    icon: ArrowLeftRight,
    title: "Organize transfers",
    description:
      "Keep track of transfers between accounts and recurring transactions.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img
              src={logo}
              alt="CWAD Expense"
              className="size-9 object-contain"
            />
            <span className="text-sm font-semibold tracking-tight">
              CWAD Expense
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>

            <Button  size="sm">
              <Link to="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              Personal finance management
            </p>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-tight">
              Take control of your money, one step at a time.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Track your income, manage expenses, plan budgets, and monitor
              financial goals with CWAD Expense.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button  size="lg">
                <Link to="/register">
                  Create your account
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button  variant="outline" size="lg">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Organize your financial records in one place.
            </p>
          </div>

          {/* Simple dashboard preview */}
          <div className="rounded-xl border bg-muted/20 p-4 sm:p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-sm font-medium">Financial overview</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Example dashboard preview
                </p>
              </div>

              <div className="rounded-md border bg-background p-2">
                <ChartNoAxesCombined className="size-5 text-primary" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">
                  Income
                </p>
                <p className="mt-2 text-xl font-semibold">₹ 0.00</p>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">
                  Expenses
                </p>
                <p className="mt-2 text-xl font-semibold">₹ 0.00</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Monthly budget</p>
                <span className="text-xs text-muted-foreground">
                  Example
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/3 rounded-full bg-primary" />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                A simple view of your budget progress.
              </p>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Illustrative preview — not actual financial data.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Features</p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Everything you need to organize your finances
          </h2>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Manage everyday financial activities through one straightforward
            interface.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-lg border p-5">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>

              <h3 className="mt-4 text-base font-semibold">{title}</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="border-y bg-muted/20">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Start organizing your finances today
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Create an account to start recording your financial activity
            and planning your budgets.
          </p>

          <Button  className="mt-6">
            <Link to="/register">
              Get started
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} CWAD Expense. All rights reserved.
          </p>

          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              to="/terms-and-conditions"
              className="hover:text-foreground"
            >
              Terms & Conditions
            </Link>

            <Link
              to="/privacy-policy"
              className="hover:text-foreground"
            >
              Privacy Policy
            </Link>

            <Link to="/login" className="hover:text-foreground">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
