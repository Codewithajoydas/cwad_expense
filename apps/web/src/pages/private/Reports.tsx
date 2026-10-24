
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  TrendingDown,
  TrendingUp,
  Wallet,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
  ChartColumn,
  CircleDollarSign,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAllTransactions, type Transaction as ApiTransaction } from "@/lib/api-client";

type TransactionType = "income" | "expense";

type Transaction = {
  id: string;
  title: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  account: string;
};

const today = new Date();

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const monthNames = Array.from({ length: 6 }, (_, index) => {
  const date = new Date(
    today.getFullYear(),
    today.getMonth() - 5 + index,
    1,
  );

  return {
    key: `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`,
    label: new Intl.DateTimeFormat("en-IN", {
      month: "short",
    }).format(date),
  };
});

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const compactCurrency = (amount: number) => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }

  return `₹${amount}`;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function getMonthKey(date: string) {
  return date.slice(0, 7);
}

function getRangeStart(range: string) {
  const currentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  );

  if (range === "month") {
    return dateKey(currentMonth);
  }

  if (range === "3months") {
    return dateKey(
      new Date(today.getFullYear(), today.getMonth() - 2, 1),
    );
  }

  if (range === "6months") {
    return dateKey(
      new Date(today.getFullYear(), today.getMonth() - 5, 1),
    );
  }

  if (range === "year") {
    return `${today.getFullYear()}-01-01`;
  }

  return "";
}

export default function Reports() {
  const [range, setRange] = useState("6months");
  const [typeFilter, setTypeFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    getAllTransactions()
      .then((records) => {
        if (!active) return;
        setTransactions(
          records
            .filter(
              (record): record is ApiTransaction & { type: "income" | "expense" } =>
                record.status === "completed" && record.type !== "transfer",
            )
            .map((record) => ({
              id: record._id,
              title: record.description || record.type,
              category:
                typeof record.category === "object" && record.category
                  ? record.category.name
                  : "Uncategorized",
              type: record.type,
              amount: record.amount,
              date: record.date.slice(0, 10),
              account:
                typeof record.account === "object"
                  ? record.account.name
                  : "Account",
            })),
        );
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Unable to load reports.");
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    const startDate = getRangeStart(range);

    return transactions.filter((transaction) => {
      const matchesDate =
        !startDate || transaction.date >= startDate;

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      return matchesDate && matchesType;
    });
  }, [transactions, range, typeFilter]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expenses = filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      income,
      expenses,
      savings: income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    return monthNames.map((month) => {
      const items = filteredTransactions.filter(
        (transaction) => getMonthKey(transaction.date) === month.key,
      );

      const income = items
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const expenses = items
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      return {
        ...month,
        income,
        expenses,
      };
    });
  }, [filteredTransactions]);

  const maxMonthlyAmount = Math.max(
    1,
    ...monthlyData.flatMap((month) => [month.income, month.expenses]),
  );

  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();

    filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        totals.set(
          transaction.category,
          (totals.get(transaction.category) ?? 0) +
            transaction.amount,
        );
      });

    return Array.from(totals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          summary.expenses > 0
            ? (amount / summary.expenses) * 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, summary.expenses]);

  const accountData = useMemo(() => {
    const totals = new Map<string, number>();

    filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        totals.set(
          transaction.account,
          (totals.get(transaction.account) ?? 0) +
            transaction.amount,
        );
      });

    return Array.from(totals.entries())
      .map(([account, amount]) => ({ account, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  function exportCSV() {
    const headers = [
      "Date",
      "Title",
      "Category",
      "Type",
      "Amount",
      "Account",
    ];

    const rows = filteredTransactions.map((transaction) => [
      transaction.date,
      transaction.title,
      transaction.category,
      transaction.type,
      String(transaction.amount),
      transaction.account,
    ]);

    const escapeCSV = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cwad-expense-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {loadError && (
          <p role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
            {loadError}
          </p>
        )}
        {/* Header */}
        <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>Report period</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={range}
              onChange={(event) => setRange(event.target.value)}
              aria-label="Report date range"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="month">This month</option>
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="year">This year</option>
              <option value="all">All available data</option>
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Transaction type"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Income & expenses</option>
              <option value="income">Income only</option>
              <option value="expense">Expenses only</option>
            </select>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Total income
                </p>
                <TrendingUp className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(summary.income)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {filteredTransactions.filter((item) => item.type === "income").length} income records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Total expenses
                </p>
                <TrendingDown className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(summary.expenses)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {filteredTransactions.filter((item) => item.type === "expense").length} expense records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Net savings
                </p>
                <Wallet className="size-4 text-muted-foreground" />
              </div>
              <p
                className={`mt-3 text-2xl font-semibold ${
                  summary.savings < 0 ? "text-destructive" : ""
                }`}
              >
                {currency(summary.savings)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Income minus expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Savings rate
                </p>
                <CircleDollarSign className="size-4 text-muted-foreground" />
              </div>
              <p
                className={`mt-3 text-2xl font-semibold ${
                  summary.savingsRate < 0 ? "text-destructive" : ""
                }`}
              >
                {summary.savingsRate.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Net savings as a percentage of income
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Income vs expenses chart */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold">Income vs. Expenses</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Monthly comparison across the last six months.
                </p>
              </div>

              <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm bg-primary" />
                  Income
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm bg-muted-foreground" />
                  Expenses
                </div>
              </div>
            </div>

            <div className="mt-6 flex h-64 gap-2 sm:gap-5">
              <div className="flex flex-col justify-between pb-7 text-right text-[10px] text-muted-foreground">
                <span>{compactCurrency(maxMonthlyAmount)}</span>
                <span>{compactCurrency(maxMonthlyAmount * 0.75)}</span>
                <span>{compactCurrency(maxMonthlyAmount * 0.5)}</span>
                <span>{compactCurrency(maxMonthlyAmount * 0.25)}</span>
                <span>₹0</span>
              </div>

              <div className="relative flex min-w-0 flex-1 items-stretch justify-around gap-1 border-b border-l pb-0">
                {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                  <div
                    key={fraction}
                    className="pointer-events-none absolute right-0 left-0 border-t border-dashed"
                    style={{ bottom: `${fraction * 100}%` }}
                  />
                ))}

                {monthlyData.map((month) => (
                  <div
                    key={month.key}
                    className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <div className="flex h-[calc(100%-28px)] w-full items-end justify-center gap-1 px-0.5 sm:gap-2">
                      <div
                        title={`Income: ${currency(month.income)}`}
                        className="min-h-0.5 w-2 rounded-t-sm bg-primary sm:w-5"
                        style={{
                          height: `${(month.income / maxMonthlyAmount) * 100}%`,
                        }}
                      />
                      <div
                        title={`Expenses: ${currency(month.expenses)}`}
                        className="min-h-0.5 w-2 rounded-t-sm bg-muted-foreground sm:w-5"
                        style={{
                          height: `${(month.expenses / maxMonthlyAmount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="mt-2 h-5 text-[10px] text-muted-foreground sm:text-xs">
                      {month.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Chart values follow the selected report filters. Months outside
              the selected date range may show zero.
            </p>
          </CardContent>
        </Card>

        {/* Category breakdown and account spending */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <ChartColumn className="size-4 text-muted-foreground" />
                <h2 className="font-semibold">Expenses by category</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                See where your money is going.
              </p>

              {categoryData.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No expense data for this selection.
                </p>
              ) : (
                <div className="mt-6 space-y-5">
                  {categoryData.map((item) => (
                    <div key={item.category}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">
                          {item.category}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-medium">
                            {currency(item.amount)}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-muted-foreground" />
                <h2 className="font-semibold">Spending by account</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Expense totals grouped by payment account.
              </p>

              {accountData.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No account spending data for this selection.
                </p>
              ) : (
                <div className="mt-6 space-y-5">
                  {accountData.map((item) => {
                    const percentage =
                      summary.expenses > 0
                        ? (item.amount / summary.expenses) * 100
                        : 0;

                    return (
                      <div key={item.account}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium">
                            {item.account}
                          </span>
                          <span className="text-sm font-medium">
                            {currency(item.amount)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-muted-foreground"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% of total expenses
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent transactions */}
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold">Transaction details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Transactions included in this report.
                </p>
              </div>
              <Badge variant="outline">
                {summary.count} transactions
              </Badge>
            </div>

            <Separator />

            {recentTransactions.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted-foreground">
                No transactions found for this report.
              </p>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 text-left font-medium">
                          Transaction
                        </th>
                        <th className="px-5 py-3 text-left font-medium">
                          Category
                        </th>
                        <th className="px-5 py-3 text-left font-medium">
                          Date
                        </th>
                        <th className="px-5 py-3 text-left font-medium">
                          Account
                        </th>
                        <th className="px-5 py-3 text-right font-medium">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction) => {
                        const isIncome = transaction.type === "income";

                        return (
                          <tr
                            key={transaction.id}
                            className="border-t transition-colors hover:bg-muted/20"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                                  {isIncome ? (
                                    <ArrowDownRight className="size-4" />
                                  ) : (
                                    <ArrowUpRight className="size-4" />
                                  )}
                                </div>
                                <span className="font-medium">
                                  {transaction.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-muted-foreground">
                              {transaction.category}
                            </td>
                            <td className="px-5 py-4 text-muted-foreground">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-5 py-4 text-muted-foreground">
                              {transaction.account}
                            </td>
                            <td
                              className={`px-5 py-4 text-right font-medium ${
                                isIncome ? "text-primary" : ""
                              }`}
                            >
                              {isIncome ? "+" : "−"}
                              {currency(transaction.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y md:hidden">
                  {recentTransactions.map((transaction) => {
                    const isIncome = transaction.type === "income";

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3 p-4"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                          {isIncome ? (
                            <ArrowDownRight className="size-4" />
                          ) : (
                            <ArrowUpRight className="size-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {transaction.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {transaction.category} · {formatDate(transaction.date)}
                          </p>
                        </div>

                        <p
                          className={`shrink-0 text-sm font-medium ${
                            isIncome ? "text-primary" : ""
                          }`}
                        >
                          {isIncome ? "+" : "−"}
                          {currency(transaction.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="size-4" />
                CSV export includes all transactions matching the filters.
              </div>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="mr-2 size-4" />
                Export report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report note */}
        <div className="flex items-start gap-3 rounded-lg border bg-background p-4">
          <Receipt className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">About these reports</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Income, expenses, category totals, and account totals are
              calculated from the transactions included in the current
              selection. Savings here means income minus expenses; it is
              not the same as your actual account balance.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
