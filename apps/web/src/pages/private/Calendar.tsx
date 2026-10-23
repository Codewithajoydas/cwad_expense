
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Transaction = {
  id: number;
  title: string;
  category: string;
  amount: number;
  type: "expense" | "income";
  date: string;
  account: string;
};

const today = new Date();

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function makeDate(day: number) {
  return formatDateKey(
    new Date(today.getFullYear(), today.getMonth(), day),
  );
}

const initialTransactions: Transaction[] = [
  {
    id: 1,
    title: "Grocery shopping",
    category: "Food",
    amount: 1250,
    type: "expense",
    date: makeDate(2),
    account: "HDFC Bank",
  },
  {
    id: 2,
    title: "Monthly salary",
    category: "Salary",
    amount: 45000,
    type: "income",
    date: makeDate(5),
    account: "HDFC Bank",
  },
  {
    id: 3,
    title: "Electricity bill",
    category: "Bills",
    amount: 1800,
    type: "expense",
    date: makeDate(8),
    account: "HDFC Bank",
  },
  {
    id: 4,
    title: "Lunch",
    category: "Food",
    amount: 350,
    type: "expense",
    date: makeDate(10),
    account: "Cash",
  },
  {
    id: 5,
    title: "Freelance project",
    category: "Freelance",
    amount: 8500,
    type: "income",
    date: makeDate(12),
    account: "HDFC Bank",
  },
  {
    id: 6,
    title: "Petrol",
    category: "Transport",
    amount: 1200,
    type: "expense",
    date: makeDate(15),
    account: "Cash",
  },
  {
    id: 7,
    title: "Online shopping",
    category: "Shopping",
    amount: 2499,
    type: "expense",
    date: makeDate(18),
    account: "HDFC Bank",
  },
  {
    id: 8,
    title: "Restaurant",
    category: "Food",
    amount: 850,
    type: "expense",
    date: makeDate(20),
    account: "Cash",
  },
  {
    id: 9,
    title: "Internet bill",
    category: "Bills",
    amount: 799,
    type: "expense",
    date: makeDate(today.getDate()),
    account: "HDFC Bank",
  },
];

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar() {
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));
  const [transactions] = useState(initialTransactions);
  const [filter, setFilter] = useState<"all" | "expense" | "income">("all");

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Convert Sunday-first JavaScript weekday to Monday-first.
    const startingOffset = (firstDay.getDay() + 6) % 7;

    const cells: (Date | null)[] = [];

    for (let i = 0; i < startingOffset; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [year, month]);

  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};

    transactions.forEach((transaction) => {
      if (!grouped[transaction.date]) {
        grouped[transaction.date] = [];
      }

      grouped[transaction.date].push(transaction);
    });

    return grouped;
  }, [transactions]);

  const selectedTransactions = (transactionsByDate[selectedDate] ?? []).filter(
    (transaction) =>
      filter === "all" || transaction.type === filter,
  );

  const selectedIncome = selectedTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const selectedExpenses = selectedTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const monthTransactions = transactions.filter((transaction) => {
    const date = new Date(`${transaction.date}T12:00:00`);

    return date.getFullYear() === year && date.getMonth() === month;
  });

  const monthIncome = monthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const monthExpenses = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  function changeMonth(offset: number) {
    setVisibleMonth(new Date(year, month + offset, 1));
  }

  function goToToday() {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(formatDateKey(today));
  }

  function getDayTotals(dateKey: string) {
    const dayTransactions = transactionsByDate[dateKey] ?? [];

    return {
      income: dayTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      expense: dayTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      count: dayTransactions.length,
    };
  }

  return (
    <main className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">

          <Button variant="outline" onClick={goToToday}>
            <CalendarDays className="mr-2 size-4" />
            Today
          </Button>
        </div>

        {/* Monthly summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Monthly income
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {currency(monthIncome)}
                </p>
              </div>
              <div className="rounded-md bg-muted p-2.5">
                <TrendingUp className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Monthly expenses
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {currency(monthExpenses)}
                </p>
              </div>
              <div className="rounded-md bg-muted p-2.5">
                <TrendingDown className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Net cash flow
                </p>
                <p
                  className={`mt-2 text-xl font-semibold ${
                    monthIncome - monthExpenses < 0
                      ? "text-destructive"
                      : ""
                  }`}
                >
                  {currency(monthIncome - monthExpenses)}
                </p>
              </div>
              <div className="rounded-md bg-muted p-2.5">
                <Wallet className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar and selected day */}
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
          <Card className="min-w-0">
            <CardContent className="p-3 sm:p-5">
              {/* Month navigation */}
              <div className="mb-5 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">
                    {monthFormatter.format(visibleMonth)}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Select a date to see transactions
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => changeMonth(-1)}
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => changeMonth(1)}
                    aria-label="Next month"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7">
                {weekdays.map((day) => (
                  <div
                    key={day}
                    className="pb-3 text-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Date grid */}
              <div className="grid grid-cols-7 border-l border-t">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-[70px] border-b border-r bg-muted/20 sm:min-h-[100px]"
                      />
                    );
                  }

                  const dateKey = formatDateKey(date);
                  const totals = getDayTotals(dateKey);
                  const isSelected = dateKey === selectedDate;
                  const isToday = dateKey === formatDateKey(today);
                  const hasTransactions = totals.count > 0;

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => setSelectedDate(dateKey)}
                      aria-pressed={isSelected}
                      aria-label={`${date.getDate()} ${monthFormatter.format(
                        date,
                      )}, ${totals.count} transactions`}
                      className={[
                        "relative flex min-h-[70px] flex-col items-center border-b border-r p-1.5 text-center transition-colors sm:min-h-[100px] sm:items-start sm:p-2",
                        isSelected
                          ? "bg-accent"
                          : "bg-background hover:bg-muted/50",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex size-7 items-center justify-center rounded-full text-xs sm:size-8 sm:text-sm",
                          isToday
                            ? "bg-primary font-semibold text-primary-foreground"
                            : isSelected
                              ? "font-semibold text-accent-foreground"
                              : "text-foreground",
                        ].join(" ")}
                      >
                        {date.getDate()}
                      </span>

                      {hasTransactions && (
                        <div className="mt-1 hidden w-full space-y-1 sm:block">
                          {totals.expense > 0 && (
                            <p className="truncate text-[10px] text-muted-foreground">
                              −{currency(totals.expense)}
                            </p>
                          )}
                          {totals.income > 0 && (
                            <p className="truncate text-[10px] text-primary">
                              +{currency(totals.income)}
                            </p>
                          )}
                        </div>
                      )}

                      {hasTransactions && (
                        <div className="mt-1 flex gap-1 sm:hidden">
                          {totals.expense > 0 && (
                            <span className="size-1.5 rounded-full bg-muted-foreground" />
                          )}
                          {totals.income > 0 && (
                            <span className="size-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-muted-foreground" />
                  Expenses
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" />
                  Income
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected date details */}
          <Card className="min-w-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Selected date
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    {fullDateFormatter.format(
                      new Date(`${selectedDate}T12:00:00`),
                    )}
                  </h2>
                </div>

                <Button
                  size="icon"
                  variant="outline"
                  className="size-9 shrink-0"
                  onClick={() =>
                    (window.location.href = "/create-expense")
                  }
                  aria-label="Add expense"
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p className="mt-1 font-semibold text-primary">
                    {currency(selectedIncome)}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <p className="mt-1 font-semibold">
                    {currency(selectedExpenses)}
                  </p>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">Transactions</h3>
                <div className="flex gap-1">
                  {(["all", "expense", "income"] as const).map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={filter === type ? "secondary" : "ghost"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setFilter(type)}
                    >
                      {type === "all"
                        ? "All"
                        : type === "expense"
                          ? "Expense"
                          : "Income"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {selectedTransactions.length === 0 ? (
                  <div className="rounded-md border border-dashed py-8 text-center">
                    <CalendarDays className="mx-auto size-7 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium">
                      No transactions
                    </p>
                    <p className="mt-1 px-3 text-xs text-muted-foreground">
                      No transactions found for this date and filter.
                    </p>
                  </div>
                ) : (
                  selectedTransactions.map((transaction) => {
                    const isIncome = transaction.type === "income";

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                          {isIncome ? (
                            <ArrowDownLeft className="size-4" />
                          ) : (
                            <ArrowUpRight className="size-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {transaction.title}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {transaction.category} · {transaction.account}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={`text-sm font-medium ${
                              isIncome ? "text-primary" : ""
                            }`}
                          >
                            {isIncome ? "+" : "−"}
                            {currency(transaction.amount)}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-1 text-[10px] font-normal"
                          >
                            {isIncome ? "Income" : "Expense"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
