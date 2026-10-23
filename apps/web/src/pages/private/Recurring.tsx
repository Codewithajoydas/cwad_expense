
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Repeat,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Ellipsis,
  Pencil,
  Trash2,
  Pause,
  Play,
  Clock,
  Wallet,
  CircleCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Frequency = "Weekly" | "Monthly" | "Yearly";
type TransactionType = "expense" | "income";
type ScheduleStatus = "active" | "paused";

type RecurringTransaction = {
  id: number;
  title: string;
  category: string;
  type: TransactionType;
  amount: number;
  account: string;
  frequency: Frequency;
  startDate: string;
  nextDate: string;
  endDate: string;
  status: ScheduleStatus;
  note: string;
};

const today = new Date();

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function offsetDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

const initialTransactions: RecurringTransaction[] = [
  {
    id: 1,
    title: "House Rent",
    category: "Housing",
    type: "expense",
    amount: 12000,
    account: "HDFC Bank",
    frequency: "Monthly",
    startDate: offsetDate(-90),
    nextDate: offsetDate(5),
    endDate: "",
    status: "active",
    note: "Monthly house rent",
  },
  {
    id: 2,
    title: "Internet Bill",
    category: "Bills",
    type: "expense",
    amount: 799,
    account: "HDFC Bank",
    frequency: "Monthly",
    startDate: offsetDate(-60),
    nextDate: offsetDate(2),
    endDate: "",
    status: "active",
    note: "Broadband subscription",
  },
  {
    id: 3,
    title: "Monthly Salary",
    category: "Salary",
    type: "income",
    amount: 45000,
    account: "HDFC Bank",
    frequency: "Monthly",
    startDate: offsetDate(-180),
    nextDate: offsetDate(7),
    endDate: "",
    status: "active",
    note: "Monthly salary credit",
  },
  {
    id: 4,
    title: "Streaming Subscription",
    category: "Entertainment",
    type: "expense",
    amount: 499,
    account: "ICICI Credit Card",
    frequency: "Monthly",
    startDate: offsetDate(-30),
    nextDate: offsetDate(10),
    endDate: "",
    status: "active",
    note: "Entertainment subscription",
  },
  {
    id: 5,
    title: "Gym Membership",
    category: "Health",
    type: "expense",
    amount: 1500,
    account: "HDFC Bank",
    frequency: "Monthly",
    startDate: offsetDate(-30),
    nextDate: offsetDate(15),
    endDate: "",
    status: "paused",
    note: "Gym membership",
  },
  {
    id: 6,
    title: "Insurance Premium",
    category: "Insurance",
    type: "expense",
    amount: 12000,
    account: "HDFC Bank",
    frequency: "Yearly",
    startDate: offsetDate(-100),
    nextDate: offsetDate(40),
    endDate: "",
    status: "active",
    note: "Annual insurance payment",
  },
  {
    id: 7,
    title: "Weekly Groceries",
    category: "Food",
    type: "expense",
    amount: 1500,
    account: "Cash",
    frequency: "Weekly",
    startDate: offsetDate(-20),
    nextDate: offsetDate(3),
    endDate: "",
    status: "active",
    note: "Weekly household groceries",
  },
];

const categories = [
  "Housing",
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Insurance",
  "Salary",
  "Freelance",
  "Business",
  "Other",
];

const accounts = [
  "Cash",
  "HDFC Bank",
  "SBI Savings",
  "ICICI Credit Card",
];

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

function formatDate(value: string) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function getMonthlyAmount(item: RecurringTransaction) {
  if (item.frequency === "Weekly") return (item.amount * 52) / 12;
  if (item.frequency === "Yearly") return item.amount / 12;

  return item.amount;
}

const emptyForm = {
  title: "",
  category: "Bills",
  type: "expense" as TransactionType,
  amount: "",
  account: "HDFC Bank",
  frequency: "Monthly" as Frequency,
  startDate: dateKey(today),
  nextDate: offsetDate(1),
  endDate: "",
  note: "",
};

export default function Recurring() {
  const [transactions, setTransactions] =
    useState<RecurringTransaction[]>(initialTransactions);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const summary = useMemo(() => {
    const active = transactions.filter(
      (item) => item.status === "active",
    );

    const expenses = active.filter((item) => item.type === "expense");
    const income = active.filter((item) => item.type === "income");

    const monthlyExpenses = expenses.reduce(
      (sum, item) => sum + getMonthlyAmount(item),
      0,
    );

    const monthlyIncome = income.reduce(
      (sum, item) => sum + getMonthlyAmount(item),
      0,
    );

    const upcoming = active.filter(
      (item) => item.nextDate >= dateKey(today),
    ).length;

    return {
      active: active.length,
      paused: transactions.length - active.length,
      monthlyExpenses,
      monthlyIncome,
      upcoming,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        const query = search.toLowerCase();

        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.account.toLowerCase().includes(query);

        const matchesType =
          typeFilter === "all" || item.type === typeFilter;

        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  }, [transactions, search, typeFilter, statusFilter]);

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);
  }

  function openEditDialog(item: RecurringTransaction) {
    setEditingId(item.id);

    setForm({
      title: item.title,
      category: item.category,
      type: item.type,
      amount: String(item.amount),
      account: item.account,
      frequency: item.frequency,
      startDate: item.startDate,
      nextDate: item.nextDate,
      endDate: item.endDate,
      note: item.note,
    });

    setFormError("");
    setDialogOpen(true);
  }

  function saveTransaction() {
    const amount = Number(form.amount);

    if (!form.title.trim()) {
      setFormError("Please enter a transaction name.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    if (!form.startDate || !form.nextDate) {
      setFormError("Please select the start date and next due date.");
      return;
    }

    if (form.nextDate < form.startDate) {
      setFormError("Next due date cannot be before the start date.");
      return;
    }

    if (form.endDate && form.endDate < form.startDate) {
      setFormError("End date cannot be before the start date.");
      return;
    }

    if (form.endDate && form.nextDate > form.endDate) {
      setFormError("Next due date cannot be after the end date.");
      return;
    }

    const existing = transactions.find(
      (item) => item.id === editingId,
    );

    const updated: RecurringTransaction = {
      id: editingId ?? Date.now(),
      title: form.title.trim(),
      category: form.category,
      type: form.type,
      amount,
      account: form.account,
      frequency: form.frequency,
      startDate: form.startDate,
      nextDate: form.nextDate,
      endDate: form.endDate,
      status: existing?.status ?? "active",
      note: form.note.trim(),
    };

    if (editingId !== null) {
      setTransactions((current) =>
        current.map((item) =>
          item.id === editingId ? updated : item,
        ),
      );
    } else {
      setTransactions((current) => [updated, ...current]);
    }

    setDialogOpen(false);
    setFormError("");
  }

  function toggleStatus(id: number) {
    setTransactions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "active" ? "paused" : "active",
            }
          : item,
      ),
    );
  }

  function deleteTransaction() {
    if (deleteId === null) return;

    setTransactions((current) =>
      current.filter((item) => item.id !== deleteId),
    );

    setDeleteId(null);
  }

  const transactionToDelete = transactions.find(
    (item) => item.id === deleteId,
  );

  return (
    <main className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 size-4" />
            Create schedule
          </Button>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Active schedules
                </p>
                <Repeat className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {summary.active}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.paused} paused
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Monthly expenses
                </p>
                <TrendingDown className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(summary.monthlyExpenses)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Estimated monthly equivalent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Monthly income
                </p>
                <TrendingUp className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(summary.monthlyIncome)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Estimated monthly equivalent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Upcoming payments
                </p>
                <CalendarDays className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {summary.upcoming}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Active schedules with upcoming dates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming section */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <Clock className="size-5" />
              </div>
              <div>
                <h2 className="font-medium">Stay on top of regular payments</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review upcoming due dates and keep your recurring schedules
                  up to date. Schedules on this page do not automatically
                  create transactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and filters */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, category, or account..."
                className="pl-9"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter by transaction type"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm lg:w-44"
            >
              <option value="all">All types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by schedule status"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm lg:w-40"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Your schedules</h2>
            <p className="text-sm text-muted-foreground">
              {filteredTransactions.length} schedules
            </p>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-background px-6 py-12 text-center">
              <Repeat className="mx-auto size-8 text-muted-foreground" />
              <h3 className="mt-3 font-medium">No schedules found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Change your filters or create a recurring transaction.
              </p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 size-4" />
                Create schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((item) => {
                const isExpense = item.type === "expense";
                const isActive = item.status === "active";
                const dueToday = item.nextDate === dateKey(today);
                const overdue =
                  isActive && item.nextDate < dateKey(today);

                return (
                  <Card key={item.id}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          {isExpense ? (
                            <TrendingDown className="size-5" />
                          ) : (
                            <TrendingUp className="size-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{item.title}</h3>

                            <Badge
                              variant="outline"
                              className={
                                isActive
                                  ? "border-primary/30 text-primary"
                                  : "text-muted-foreground"
                              }
                            >
                              {isActive ? "Active" : "Paused"}
                            </Badge>

                            {overdue && (
                              <Badge variant="destructive">Past due</Badge>
                            )}

                            {!overdue && dueToday && isActive && (
                              <Badge variant="secondary">Due today</Badge>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.category} · {item.account}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Amount
                              </p>
                              <p
                                className={`mt-1 text-sm font-semibold ${
                                  !isExpense ? "text-primary" : ""
                                }`}
                              >
                                {isExpense ? "−" : "+"}
                                {currency(item.amount)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Frequency
                              </p>
                              <p className="mt-1 text-sm font-medium">
                                {item.frequency}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Next due date
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                                <CalendarDays className="size-3.5 text-muted-foreground" />
                                {formatDate(item.nextDate)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                End date
                              </p>
                              <p className="mt-1 text-sm font-medium">
                                {formatDate(item.endDate)}
                              </p>
                            </div>
                          </div>

                          {item.note && (
                            <p className="mt-3 text-xs text-muted-foreground">
                              {item.note}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleStatus(item.id)}
                            >
                              {isActive ? (
                                <>
                                  <Pause className="mr-1.5 size-3.5" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="mr-1.5 size-3.5" />
                                  Resume
                                </>
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="mr-1.5 size-3.5" />
                              Edit
                            </Button>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0"
                              aria-label={`Actions for ${item.title}`}
                            >
                              <Ellipsis className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit schedule
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => toggleStatus(item.id)}
                            >
                              {isActive ? (
                                <>
                                  <Pause className="mr-2 size-4" />
                                  Pause schedule
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 size-4" />
                                  Resume schedule
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete schedule
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Info */}
        <div className="flex items-start gap-3 rounded-lg border bg-background p-4">
          <Wallet className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">How recurring schedules work</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This page manages your schedule definitions. Automatic
              transaction creation, reminders, and account balance updates
              require backend integration.
            </p>
          </div>
        </div>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null
                ? "Edit recurring transaction"
                : "Create recurring transaction"}
            </DialogTitle>
            <DialogDescription>
              Configure a regular income or expense schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] space-y-4 overflow-y-auto py-2 pr-1">
            <div className="space-y-2">
              <Label htmlFor="recurringTitle">Transaction name</Label>
              <Input
                id="recurringTitle"
                placeholder="e.g. House rent"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringType">Transaction type</Label>
              <select
                id="recurringType"
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as TransactionType,
                    category:
                      event.target.value === "income" ? "Salary" : "Bills",
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringAmount">Amount (₹)</Label>
              <Input
                id="recurringAmount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringCategory">Category</Label>
              <select
                id="recurringCategory"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {categories
                  .filter((category) =>
                    form.type === "income"
                      ? ["Salary", "Freelance", "Business", "Other"].includes(
                          category,
                        )
                      : category !== "Salary" &&
                        category !== "Freelance" &&
                        category !== "Business",
                  )
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringAccount">Account</Label>
              <select
                id="recurringAccount"
                value={form.account}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    account: event.target.value,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {accounts.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringFrequency">Frequency</Label>
              <select
                id="recurringFrequency"
                value={form.frequency}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    frequency: event.target.value as Frequency,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recurringStart">Start date</Label>
                <Input
                  id="recurringStart"
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurringNext">Next due date</Label>
                <Input
                  id="recurringNext"
                  type="date"
                  value={form.nextDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nextDate: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringEnd">End date (optional)</Label>
              <Input
                id="recurringEnd"
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringNote">Note (optional)</Label>
              <Input
                id="recurringNote"
                placeholder="Add a note"
                value={form.note}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveTransaction}>
              {editingId !== null ? "Save changes" : "Create schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete recurring schedule?</DialogTitle>
            <DialogDescription>
              {transactionToDelete
                ? `"${transactionToDelete.title}" will be removed from your recurring schedules.`
                : "This schedule will be removed."}{" "}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteTransaction}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
