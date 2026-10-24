import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Ellipsis,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router";
import {
  getAccounts,
  getAllTransactions,
  type Account,
  type Transaction as ApiTransaction,
} from "@/lib/api-client";

type Transaction = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  icon: LucideIcon;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return currency.format(amount);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function StatCard({
  title,
  amount,
  description,
  icon: Icon,
  trend,
  trendType,
}: {
  title: string;
  amount: string;
  description: string;
  icon: LucideIcon;
  trend: string;
  trendType: "positive" | "negative" | "neutral";
}) {
  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/30">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="px-5">
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {amount}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={
              trendType === "positive"
                ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : trendType === "negative"
                  ? "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                  : ""
            }
          >
            {trend}
          </Badge>

          <span className="text-xs text-muted-foreground">
            {description}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadError, setLoadError] = useState("");
  const currentMonthKey = monthKey(new Date());

  useEffect(() => {
    let active = true;
    Promise.all([getAllTransactions(), getAccounts({ isActive: true })])
      .then(([records, userAccounts]) => {
        if (!active) return;
        setTransactions(
          records
            .filter((record) => record.status === "completed")
            .map((record: ApiTransaction) => ({
            id: record._id,
            title: record.description || record.type,
            category:
              typeof record.category === "object" && record.category
                ? record.category.name
                : "Uncategorized",
            date: record.date.slice(0, 10),
            amount: record.amount,
            type: record.type,
            icon:
              record.type === "income"
                ? ArrowDownLeft
                : record.type === "transfer"
                  ? ArrowLeftRight
                  : ArrowUpRight,
            })),
        );
        setAccounts(userAccounts);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Unable to load dashboard data.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const currentMonthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const record = transaction as Transaction & { date: string };
        return record.date.includes(currentMonthKey);
      }),
    [transactions, currentMonthKey],
  );
  const totalIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = currentMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const savings = totalIncome - totalExpenses;
  const monthlyData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - 5 + index);
        const key = monthKey(date);
        const records = transactions.filter((transaction) => transaction.date.slice(0, 7) === key);
        return {
          month: date.toLocaleDateString("en-IN", { month: "short" }),
          income: records
            .filter((transaction) => transaction.type === "income")
            .reduce((sum, transaction) => sum + transaction.amount, 0),
          expense: records
            .filter((transaction) => transaction.type === "expense")
            .reduce((sum, transaction) => sum + transaction.amount, 0),
        };
      }),
    [transactions],
  );
  const spendingCategories = useMemo(() => {
    const totals = new Map<string, number>();
    currentMonthTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) =>
        totals.set(
          transaction.category,
          (totals.get(transaction.category) ?? 0) + transaction.amount,
        ),
      );
    return Array.from(totals.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        icon: CircleDollarSign,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthTransactions, totalExpenses]);
  const maxMonthlyValue = Math.max(
    1,
    ...monthlyData.map((item) => Math.max(item.income, item.expense)),
  );

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360 space-y-8">
        {loadError && (
          <p role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
            {loadError}
          </p>
        )}
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <Button variant="outline" className="gap-2">
              <CalendarDays className="size-4" />
              {new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date())}
            </Button>

            <Button variant="default" className={"flex justify-center"}>
                <Plus className="size-4" />
              <Link to="/create-expense">
                Add transaction
              </Link>
            </Button>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total balance"
            amount={formatCurrency(totalBalance)}
            description="Across all accounts"
            icon={Wallet}
            trend="Available"
            trendType="neutral"
          />

          <StatCard
            title="Total income"
            amount={formatCurrency(totalIncome)}
            description="This month"
            icon={ArrowDownLeft}
            trend="+12.5%"
            trendType="positive"
          />

          <StatCard
            title="Total expenses"
            amount={formatCurrency(totalExpenses)}
            description="This month"
            icon={ArrowUpRight}
            trend="+4.2%"
            trendType="negative"
          />

          <StatCard
            title="Net savings"
            amount={formatCurrency(savings)}
            description="Income minus expenses"
            icon={TrendingUp}
            trend="55.6% saved"
            trendType="positive"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Cash Flow Chart */}
          <Card className="gap-5 py-5 xl:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 sm:px-6">
              <div>
                <CardTitle className="text-base font-semibold">
                  Cash flow
                </CardTitle>
                <CardDescription className="mt-1">
                  Income vs expenses over the last six months
                </CardDescription>
              </div>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Cash flow options"
              >
                <Ellipsis className="size-5" />
              </Button>
            </CardHeader>

            <CardContent className="px-5 sm:px-6">
              <div className="mb-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm bg-foreground" />
                  Income
                </div>

                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm bg-muted-foreground/40" />
                  Expenses
                </div>
              </div>

              <div className="grid h-56 grid-cols-6 gap-3 border-b border-border/70 sm:gap-5">
                {monthlyData.map((item) => (
                  <div
                    key={item.month}
                    className="flex min-w-0 flex-col items-center justify-end"
                  >
                    <div className="flex h-full w-full items-end justify-center gap-1 sm:gap-2">
                      <div
                        title={`Income: ${formatCurrency(item.income)}`}
                        className="w-full max-w-7 rounded-t-sm bg-foreground transition-opacity hover:opacity-75"
                        style={{
                          height: `${(item.income / maxMonthlyValue) * 100}%`,
                        }}
                      />

                      <div
                        title={`Expenses: ${formatCurrency(item.expense)}`}
                        className="w-full max-w-7 rounded-t-sm bg-muted-foreground/35 transition-opacity hover:opacity-75"
                        style={{
                          height: `${(item.expense / maxMonthlyValue) * 100}%`,
                        }}
                      />
                    </div>

                    <span className="mt-3 pb-2 text-xs text-muted-foreground">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    This month income
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    This month expenses
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Net cash flow
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatCurrency(savings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spending Breakdown */}
          <Card className="gap-5 py-5">
            <CardHeader className="px-5">
              <CardTitle className="text-base font-semibold">
                Spending breakdown
              </CardTitle>
              <CardDescription>
                Where your money goes this month
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 px-5">
              <div>
                <p className="text-2xl font-semibold">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total categorized expenses
                </p>
              </div>

              <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                {spendingCategories.map((item, index) => (
                  <div
                    key={item.name}
                    title={`${item.name}: ${item.percentage}%`}
                    className={
                      index % 2 === 0
                        ? "h-full bg-foreground"
                        : "h-full bg-muted-foreground/40"
                    }
                    style={{ width: `${item.percentage}%` }}
                  />
                ))}
              </div>

              <div className="space-y-5">
                {spendingCategories.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate text-sm">
                            {item.name}
                          </span>
                        </div>

                        <span className="shrink-0 text-sm font-medium">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Accounts and Recent Transactions */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Accounts */}
          <Card className="gap-5 py-5">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <div>
                <CardTitle className="text-base font-semibold">
                  My accounts
                </CardTitle>
                <CardDescription className="mt-1">
                  Your available balances
                </CardDescription>
              </div>

              <Button variant="ghost" size="icon" aria-label="Account options">
                <Ellipsis className="size-5" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-3 px-5">
              {accounts.map((account) => (
                <div key={account._id} className="flex items-center justify-between gap-3 rounded-lg border p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      {account.type === "cash" || account.type === "wallet" ? (
                        <Wallet className="size-4 text-muted-foreground" />
                      ) : (
                        <CreditCard className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{account.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{account.type.replace("_", " ")}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formatCurrency(account.currentBalance)}</p>
                </div>
              ))}

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  Total balance
                </span>
                <span className="font-semibold">
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="gap-5 py-5 xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 sm:px-6">
              <div>
                <CardTitle className="text-base font-semibold">
                  Recent transactions
                </CardTitle>
                <CardDescription className="mt-1">
                  A summary of your latest activity
                </CardDescription>
              </div>

              <Button variant="outline" size="sm" >
                <a href="/transactions">View all</a>
              </Button>
            </CardHeader>

            <CardContent className="px-5 sm:px-6">
              <div className="space-y-1">
                {transactions.slice(0, 6).map((transaction) => {
                  const Icon = transaction.icon;
                  const isIncome = transaction.type === "income";
                  const isTransfer = transaction.type === "transfer";

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40 sm:px-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                          <Icon className="size-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {transaction.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {transaction.category} · {transaction.date}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-semibold ${
                            isIncome
                              ? "text-emerald-700 dark:text-emerald-400"
                              : ""
                          }`}
                        >
                          {isIncome ? "+" : isTransfer ? "" : "−"}
                          {formatCurrency(transaction.amount)}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {isIncome
                            ? "Income"
                            : isTransfer
                              ? "Transfer"
                              : "Expense"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Savings Insight */}
        <Card className="gap-4 py-5 shadow-none">
          <CardContent className="flex flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
                <TrendingDown className="size-5 text-muted-foreground" />
              </div>

              <div>
                <h2 className="font-semibold">Your monthly savings</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have retained{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(savings)}
                  </span>{" "}
                  from this month's income.
                </p>
              </div>
            </div>

            <Button variant="outline" >
              <a href="/create-expense">Add transaction</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function BanknoteIcon() {
  return <Wallet className="size-4 text-muted-foreground" />;
}
