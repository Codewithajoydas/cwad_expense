
import { Link } from "react-router";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  Home,
  LockKeyhole,
  Menu,
  ReceiptText,
  ShieldCheck,
  Target,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Tags,
  Repeat,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/images/cwad-expense-logo.png";

const navigation = [
  { label: "Features", href: "#features", icon: LayoutDashboard },
  { label: "How it works", href: "#how-it-works", icon: ArrowLeftRight },
  { label: "FAQ", href: "#faq", icon: CircleHelp },
];

const features = [
  {
    icon: ReceiptText,
    title: "Transactions",
    description:
      "Record income and expenses with clear transaction history and categories.",
  },
  {
    icon: Wallet,
    title: "Accounts",
    description:
      "Keep your financial accounts and balances organized in one workspace.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description:
      "Review your financial activity and understand your spending patterns.",
  },
  {
    icon: PiggyBank,
    title: "Budgets",
    description:
      "Set spending limits and compare your expenses against your budget.",
  },
  {
    icon: Target,
    title: "Financial goals",
    description:
      "Set savings targets and keep track of your progress over time.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transfers",
    description:
      "Keep track of money moved between your financial accounts.",
  },
  {
    icon: Repeat,
    title: "Recurring expenses",
    description:
      "Organize regular payments, subscriptions, and recurring transactions.",
  },
  {
    icon: CalendarDays,
    title: "Financial calendar",
    description:
      "Review your financial activity by date and plan upcoming commitments.",
  },
  {
    icon: Tags,
    title: "Categories",
    description:
      "Organize transactions into categories for easier financial reviews.",
  },
];

const steps = [
  {
    number: "01",
    title: "Set up your accounts",
    description:
      "Create your account and organize the financial accounts you want to track.",
    icon: Wallet,
  },
  {
    number: "02",
    title: "Record your activity",
    description:
      "Add transactions, categorize spending, and organize your budget.",
    icon: ReceiptText,
  },
  {
    number: "03",
    title: "Review your finances",
    description:
      "Use your records and reports to understand your habits and plan ahead.",
    icon: BarChart3,
  },
];

const faqs = [
  {
    question: "What is CWAD Expense?",
    answer:
      "CWAD Expense is a personal finance application designed to help organize transactions, accounts, budgets, savings goals, and other financial records.",
  },
  {
    question: "Can I track income and expenses?",
    answer:
      "The application is designed to organize income and expenses in transaction records, helping you review your financial activity.",
  },
  {
    question: "Can I manage budgets and savings goals?",
    answer:
      "CWAD Expense includes dedicated areas for budgets and financial goals. The available functionality depends on the features implemented in your application.",
  },
  {
    question: "Does CWAD Expense connect to my bank?",
    answer:
      "Do not assume automatic bank synchronization is available. The application should only be considered connected to a bank if you have implemented and configured that integration.",
  },
  {
    question: "How is my financial information protected?",
    answer:
      "Account security depends on the authentication, backend, access controls, and data protection measures implemented in your application. Use the privacy policy for the exact details of your data handling practices.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
}

function DashboardPreview() {
  return (
    <Card className="overflow-hidden rounded-xl shadow-sm">
      <CardHeader className="border-b bg-muted/20 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">
              Overview
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Example dashboard
            </p>
          </div>

          <Badge variant="outline" className="font-normal">
            Preview
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowDownLeft className="size-4 text-emerald-600" />
              Income
            </div>

            <p className="mt-3 text-xl font-semibold tracking-tight">
              ₹0.00
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Total income
            </p>
          </div>

          <div className="rounded-lg border p-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowUpRight className="size-4 text-rose-600" />
              Expenses
            </div>

            <p className="mt-3 text-xl font-semibold tracking-tight">
              ₹0.00
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Total expenses
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Budget overview</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Example monthly budget
              </p>
            </div>

            <PiggyBank className="size-5 text-muted-foreground" />
          </div>

          <div className="mt-5 h-2 rounded-full bg-muted">
            <div className="h-2 w-0 rounded-full bg-emerald-600" />
          </div>

          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>₹0 spent</span>
            <span>₹0 budget</span>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Recent transactions</p>
            <ReceiptText className="size-4 text-muted-foreground" />
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-7 text-center">
            <FileText className="size-5 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No transactions yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your activity will appear here.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Illustrative preview. Not connected to live account data.
        </p>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="CWAD Expense home"
          >
            <img
              src={logo}
              alt=""
              className="size-9 object-contain"
            />

            <span className="text-sm font-semibold tracking-tight">
              CWAD Expense
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navigation.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-4" />
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button  variant="ghost" size="sm" className="hidden sm:inline-flex">
                <LogIn className="mr-2 size-4" />
              <Link to="/login">
                Sign in
              </Link>
            </Button>

            <Button  size="sm">
                <UserPlus className="mr-2 size-4" />
              <Link to="/register">
                Get started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-2 md:gap-16">
          <div>
            <Badge variant="outline" className="gap-2 rounded-md px-2.5 py-1">
              <Wallet className="size-3.5 text-emerald-600" />
              Personal finance management
            </Badge>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Your money deserves better organization.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Keep track of what comes in, what goes out, and what you want
              to save. CWAD Expense helps bring your financial records into
              one place.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button  size="lg">
                <Link to="/register">
                  Create account
                </Link>
                  <ArrowRight className="ml-2 size-4" />
              </Button>

              <Button  variant="outline" size="lg">
                  <LogIn className="mr-2 size-4" />
                <Link to="/login">
                  Sign in
                </Link>
              </Button>
            </div>

            <Separator className="my-7 max-w-md" />

            <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-emerald-600" />
                Expense tracking
              </span>

              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-emerald-600" />
                Budget planning
              </span>

              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-emerald-600" />
                Financial reports
              </span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-lg">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-5 md:grid-cols-[1fr_1.2fr] md:items-start">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Know your numbers. Make better decisions.
            </h2>

            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Financial clarity starts with knowing where your money goes.
              Keep everyday expenses, recurring payments, accounts, and
              savings goals organized instead of relying on scattered notes
              or disconnected spreadsheets.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <SectionHeading
            eyebrow="FEATURES"
            title="Everything you need to stay organized."
            description="A straightforward set of tools for managing day-to-day finances and reviewing your progress."
          />

          <div className="mt-9 grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="flex gap-4 border-b py-6"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
                  <Icon className="size-5 text-foreground" strokeWidth={1.7} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-y bg-muted/20"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <SectionHeading
            eyebrow="GETTING STARTED"
            title="Start simple. Build better habits."
            description="You don't need a complicated setup to begin keeping track of your finances."
          />

          <div className="mt-9 grid gap-8 md:grid-cols-3">
            {steps.map(({ number, title, description, icon: Icon }) => (
              <div key={number} className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <Icon className="size-5 text-emerald-700 dark:text-emerald-400" />
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    STEP {number}
                  </p>

                  <h3 className="mt-2 text-base font-semibold">{title}</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionHeading
                eyebrow="HELP & SUPPORT"
                title="Questions, answered."
                description="Some details about CWAD Expense and how to use it."
              />
            </div>

            <div className="divide-y rounded-lg border px-5 sm:px-6">
              {faqs.map(({ question, answer }) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    {question}

                    <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>

                  <p className="mt-3 pr-5 text-sm leading-6 text-muted-foreground">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Ready to organize your finances?
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Start keeping your financial records in one place.
            </p>
          </div>

          <Button >
            <Link to="/register">
              Get started
            </Link>
              <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <img src={logo} alt="" className="size-9 object-contain" />
                <span className="text-sm font-semibold">CWAD Expense</span>
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                A practical workspace for organizing income, expenses,
                accounts, budgets, and financial goals.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Explore</h3>

              <nav className="mt-4 flex flex-col items-start gap-3">
                {navigation.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="size-4" />
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Account & legal</h3>

              <nav className="mt-4 flex flex-col items-start gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogIn className="size-4" />
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <UserPlus className="size-4" />
                  Create account
                </Link>

                <Link
                  to="/terms-and-conditions"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FileText className="size-4" />
                  Terms & Conditions
                </Link>

                <Link
                  to="/privacy-policy"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ShieldCheck className="size-4" />
                  Privacy Policy
                </Link>
              </nav>
            </div>
          </div>

          <Separator className="my-7" />

          <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} CWAD Expense. All rights reserved.
            </p>

            <p className="inline-flex items-center gap-2">
              <LockKeyhole className="size-3.5" />
              Personal finance management
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
