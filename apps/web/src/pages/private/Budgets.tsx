
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Wallet,
  TrendingUp,
  CircleAlert,
  Ellipsis,
  Pencil,
  Trash2,
  CalendarDays,
  Utensils,
  Car,
  ShoppingBag,
  House,
  HeartPulse,
  GraduationCap,
  Plane,
  CircleDollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import {
  createBudget,
  deleteBudget,
  getAllTransactions,
  getBudgets,
  updateBudget,
  type Budget as ApiBudget,
  getCategories,
  type Category as ApiCategory,
  type Transaction,
} from "@/lib/api-client";

type Budget = {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  limit: number;
  spent: number;
  period: "Monthly" | "Weekly" | "Yearly";
};

const categoryIcons: Record<string, typeof Wallet> = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Housing: House,
  Health: HeartPulse,
  Education: GraduationCap,
  Travel: Plane,
  Other: CircleDollarSign,
};

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const currentMonth = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
}).format(new Date());

function getPeriodStart(period: Budget["period"]) {
  const start = new Date();
  if (period === "Yearly") {
    start.setMonth(0, 1);
  } else if (period === "Monthly") {
    start.setDate(1);
  } else {
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
  }
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
}

const emptyForm = {
  name: "",
  category: "",
  limit: "",
  period: "Monthly" as Budget["period"],
};

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loadError, setLoadError] = useState("");
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getBudgets(), getAllTransactions(), getCategories({ type: "expense", isActive: true })])
      .then(([records, transactions, activeCategories]) => {
        if (!active) return;
        setBudgets(
          records.map((budget: ApiBudget) => {
            const periodStart = getPeriodStart(budget.period);
            const spent = transactions
              .filter((transaction: Transaction) => {
                const transactionCategory =
                  typeof transaction.category === "object" && transaction.category
                    ? transaction.category
                    : null;
                if (
                  transaction.status !== "completed" ||
                  transaction.type !== "expense" ||
                  transaction.date.slice(0, 10) < periodStart ||
                  transaction.date.slice(0, 10) > new Date().toISOString().slice(0, 10)
                ) {
                  return false;
                }
                return budget.categoryId
                  ? transactionCategory?._id === budget.categoryId
                  : transactionCategory?.name === budget.category ||
                      transaction.category === budget.category;
              })
              .reduce((sum, transaction) => sum + transaction.amount, 0);
            return {
              id: budget._id,
              name: budget.name,
              category: budget.category,
              categoryId: budget.categoryId,
              limit: budget.limit,
              spent,
              period: budget.period,
            };
          }),
        );
        setCategories(activeCategories);
      })
      .catch((loadError: unknown) => {
        if (active) setLoadError(loadError instanceof Error ? loadError.message : "Unable to load budgets.");
      });
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    const limit = budgets.reduce((sum, budget) => sum + budget.limit, 0);
    const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const remaining = limit - spent;

    return {
      limit,
      spent,
      remaining,
      percentage: limit > 0 ? (spent / limit) * 100 : 0,
      overBudget: budgets.filter((budget) => budget.spent > budget.limit).length,
    };
  }, [budgets]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const matchesSearch =
        budget.name.toLowerCase().includes(search.toLowerCase()) ||
        budget.category.toLowerCase().includes(search.toLowerCase());

      const percentage =
        budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;

      const matchesFilter =
        filter === "All" ||
        (filter === "On track" && percentage < 80) ||
        (filter === "Near limit" && percentage >= 80 && percentage <= 100) ||
        (filter === "Exceeded" && percentage > 100);

      return matchesSearch && matchesFilter;
    });
  }, [budgets, search, filter]);

  function openCreateDialog() {
    setEditingId(null);
    setForm({ ...emptyForm, category: categories[0]?.name ?? "" });
    setError("");
    setDialogOpen(true);
  }

  function openEditDialog(budget: Budget) {
    setEditingId(budget.id);
    setForm({
      name: budget.name,
      category: budget.category,
      limit: String(budget.limit),
      period: budget.period,
    });
    setError("");
    setDialogOpen(true);
  }

  async function saveBudget() {
    const limit = Number(form.limit);

    if (!form.name.trim()) {
      setError("Please enter a budget name.");
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      setError("Budget limit must be greater than zero.");
      return;
    }

    const duplicate = budgets.some(
      (budget) =>
        budget.id !== editingId &&
        budget.category === form.category &&
        budget.period === form.period,
    );

    if (duplicate) {
      setError("A budget already exists for this category and period.");
      return;
    }

    try {
      const body = {
        name: form.name.trim(),
        category: form.category,
        categoryId: categories.find((category) => category.name === form.category)?._id,
        limit,
        period: form.period,
      };
      const saved = editingId
        ? await updateBudget(editingId, body)
        : await createBudget(body);
      setBudgets((current) => {
        const next: Budget = {
          id: saved._id,
          name: saved.name,
          category: saved.category,
          categoryId: saved.categoryId,
          limit: saved.limit,
          spent: current.find((budget) => budget.id === saved._id)?.spent ?? 0,
          period: saved.period,
        };
        return editingId
          ? current.map((budget) => (budget.id === editingId ? next : budget))
          : [next, ...current];
      });
      setDialogOpen(false);
      setError("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save budget.");
    }
  }

  async function removeBudget(id: string) {
    try {
      await deleteBudget(id);
      setBudgets((current) => current.filter((budget) => budget.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete budget.");
    }
  }

  function getStatus(budget: Budget) {
    const percentage =
      budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;

    if (percentage > 100) {
      return { label: "Exceeded", className: "border-destructive/30 text-destructive" };
    }

    if (percentage >= 80) {
      return { label: "Near limit", className: "border-amber-500/30 text-amber-600" };
    }

    return { label: "On track", className: "border-border text-muted-foreground" };
  }

  function getProgressColor(percentage: number) {
    if (percentage > 100) return "bg-destructive";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-primary";
  }

  return (
    <main className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {(loadError || error) && (
          <p role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
            {error || loadError}
          </p>
        )}
        {/* Header */}
        <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 size-4" />
            Create budget
          </Button>
        </div>

        {/* Period */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>{currentMonth}</span>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total budget</p>
                <Wallet className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(totals.limit)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Across {budgets.length} budgets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total spent</p>
                <TrendingUp className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(totals.spent)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {totals.percentage.toFixed(1)}% of allocated budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <CircleDollarSign className="size-4 text-muted-foreground" />
              </div>
              <p
                className={`mt-3 text-2xl font-semibold ${
                  totals.remaining < 0 ? "text-destructive" : ""
                }`}
              >
                {currency(totals.remaining)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Budget minus recorded spending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Over budget</p>
                <CircleAlert className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {totals.overBudget}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Categories exceeding their limits
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Overall progress */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-medium">Overall budget progress</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currency(totals.spent)} spent out of {currency(totals.limit)}
                </p>
              </div>
              <p className="text-sm font-medium">
                {totals.percentage.toFixed(1)}%
              </p>
            </div>

            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Overall budget usage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(100, Math.max(0, totals.percentage))}
            >
              <div
                className={`h-full rounded-full ${
                  totals.percentage > 100
                    ? "bg-destructive"
                    : "bg-primary"
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, totals.percentage))}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget list */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search budgets..."
                className="pl-9"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter budgets by status"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm sm:w-44"
            >
              <option>All</option>
              <option>On track</option>
              <option>Near limit</option>
              <option>Exceeded</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your budgets</h2>
            <p className="text-sm text-muted-foreground">
              {filteredBudgets.length} results
            </p>
          </div>

          {filteredBudgets.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-background px-6 py-12 text-center">
              <Wallet className="mx-auto size-8 text-muted-foreground" />
              <h3 className="mt-3 font-medium">No budgets found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another search or create a new budget.
              </p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 size-4" />
                Create budget
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredBudgets.map((budget) => {
                const Icon = categoryIcons[budget.category] ?? Wallet;
                const percentage =
                  budget.limit > 0
                    ? (budget.spent / budget.limit) * 100
                    : 0;
                const remaining = budget.limit - budget.spent;
                const status = getStatus(budget);

                return (
                  <Card key={budget.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Icon className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-medium">
                              {budget.name}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {budget.period} budget
                            </p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0"
                              aria-label={`Actions for ${budget.name}`}
                            >
                              <Ellipsis className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(budget)}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit budget
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => removeBudget(budget.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete budget
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-6 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Amount spent
                          </p>
                          <p className="mt-1 text-lg font-semibold">
                            {currency(budget.spent)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Budget limit
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {currency(budget.limit)}
                          </p>
                        </div>
                      </div>

                      <div
                        className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label={`${budget.name} usage`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(100, Math.max(0, percentage))}
                      >
                        <div
                          className={`h-full rounded-full ${getProgressColor(
                            percentage,
                          )}`}
                          style={{
                            width: `${Math.min(100, Math.max(0, percentage))}%`,
                          }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <Badge
                          variant="outline"
                          className={status.className}
                        >
                          {status.label}
                        </Badge>
                        <p
                          className={`text-xs ${
                            remaining < 0 ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {remaining < 0
                            ? `${currency(Math.abs(remaining))} over budget`
                            : `${currency(remaining)} remaining`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit budget" : "Create budget"}
            </DialogTitle>
            <DialogDescription>
              Set a spending limit for a category and time period.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="budgetName">Budget name</Label>
              <Input
                id="budgetName"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Monthly groceries"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetCategory">Category</Label>
              <select
                id="budgetCategory"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetLimit">Budget limit (₹)</Label>
              <Input
                id="budgetLimit"
                type="number"
                min="1"
                step="1"
                value={form.limit}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    limit: event.target.value,
                  }))
                }
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetPeriod">Budget period</Label>
              <select
                id="budgetPeriod"
                value={form.period}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    period: event.target.value as Budget["period"],
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
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
            <Button onClick={saveBudget}>
              {editingId !== null ? "Save changes" : "Create budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
