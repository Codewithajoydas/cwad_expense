
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Target,
  PiggyBank,
  TrendingUp,
  CalendarDays,
  Plane,
  House,
  Car,
  GraduationCap,
  Laptop,
  ShieldCheck,
  Ellipsis,
  Pencil,
  Trash2,
  CircleCheck,
  Wallet,
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

type Goal = {
  id: number;
  name: string;
  category: string;
  target: number;
  saved: number;
  targetDate: string;
  description: string;
};

const today = new Date();

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function futureDate(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return dateKey(date);
}

const initialGoals: Goal[] = [
  {
    id: 1,
    name: "Emergency Fund",
    category: "Savings",
    target: 100000,
    saved: 65000,
    targetDate: futureDate(4),
    description: "Build a financial safety net.",
  },
  {
    id: 2,
    name: "New Laptop",
    category: "Technology",
    target: 80000,
    saved: 52000,
    targetDate: futureDate(3),
    description: "Save for a new development laptop.",
  },
  {
    id: 3,
    name: "Vacation",
    category: "Travel",
    target: 50000,
    saved: 18000,
    targetDate: futureDate(6),
    description: "Plan a trip without financial stress.",
  },
  {
    id: 4,
    name: "Buy a Car",
    category: "Vehicle",
    target: 500000,
    saved: 125000,
    targetDate: futureDate(18),
    description: "Save for a personal vehicle.",
  },
  {
    id: 5,
    name: "Home Down Payment",
    category: "Home",
    target: 1000000,
    saved: 200000,
    targetDate: futureDate(36),
    description: "Build savings for a future home.",
  },
  {
    id: 6,
    name: "Professional Course",
    category: "Education",
    target: 30000,
    saved: 30000,
    targetDate: dateKey(today),
    description: "Invest in professional development.",
  },
];

const categoryOptions = [
  { value: "Savings", label: "Savings" },
  { value: "Technology", label: "Technology" },
  { value: "Travel", label: "Travel" },
  { value: "Vehicle", label: "Vehicle" },
  { value: "Home", label: "Home" },
  { value: "Education", label: "Education" },
  { value: "Other", label: "Other" },
];

const categoryIcons: Record<string, typeof Target> = {
  Savings: PiggyBank,
  Technology: Laptop,
  Travel: Plane,
  Vehicle: Car,
  Home: House,
  Education: GraduationCap,
  Other: ShieldCheck,
};

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function formatDate(value: string) {
  if (!value) return "No target date";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

const emptyForm = {
  name: "",
  category: "Savings",
  target: "",
  saved: "0",
  targetDate: "",
  description: "",
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [contributionOpen, setContributionOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [contribution, setContribution] = useState("");
  const [contributionError, setContributionError] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const summary = useMemo(() => {
    const target = goals.reduce((sum, goal) => sum + goal.target, 0);
    const saved = goals.reduce((sum, goal) => sum + goal.saved, 0);
    const completed = goals.filter(
      (goal) => goal.saved >= goal.target,
    ).length;

    return {
      target,
      saved,
      remaining: Math.max(0, target - saved),
      completed,
      active: goals.length - completed,
      progress: target > 0 ? (saved / target) * 100 : 0,
    };
  }, [goals]);

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const query = search.toLowerCase();

      const matchesSearch =
        goal.name.toLowerCase().includes(query) ||
        goal.category.toLowerCase().includes(query);

      const isCompleted = goal.saved >= goal.target;

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !isCompleted) ||
        (filter === "completed" && isCompleted);

      return matchesSearch && matchesFilter;
    });
  }, [goals, search, filter]);

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);
  }

  function openEditDialog(goal: Goal) {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      category: goal.category,
      target: String(goal.target),
      saved: String(goal.saved),
      targetDate: goal.targetDate,
      description: goal.description,
    });
    setFormError("");
    setDialogOpen(true);
  }

  function saveGoal() {
    const target = Number(form.target);
    const saved = Number(form.saved);

    if (!form.name.trim()) {
      setFormError("Please enter a goal name.");
      return;
    }

    if (!Number.isFinite(target) || target <= 0) {
      setFormError("Target amount must be greater than zero.");
      return;
    }

    if (!Number.isFinite(saved) || saved < 0) {
      setFormError("Saved amount cannot be negative.");
      return;
    }

    if (saved > target) {
      setFormError("Saved amount cannot exceed the target amount.");
      return;
    }

    const goal: Goal = {
      id: editingId ?? Date.now(),
      name: form.name.trim(),
      category: form.category,
      target,
      saved,
      targetDate: form.targetDate,
      description: form.description.trim(),
    };

    if (editingId !== null) {
      setGoals((current) =>
        current.map((item) => (item.id === editingId ? goal : item)),
      );
    } else {
      setGoals((current) => [goal, ...current]);
    }

    setDialogOpen(false);
    setFormError("");
  }

  function openContributionDialog(goal: Goal) {
    setSelectedGoalId(goal.id);
    setContribution("");
    setContributionError("");
    setContributionOpen(true);
  }

  function addContribution() {
    const amount = Number(contribution);
    const goal = goals.find((item) => item.id === selectedGoalId);

    if (!goal) return;

    if (!Number.isFinite(amount) || amount <= 0) {
      setContributionError("Enter an amount greater than zero.");
      return;
    }

    if (goal.saved + amount > goal.target) {
      setContributionError(
        `Contribution cannot exceed the remaining ${currency(
          goal.target - goal.saved,
        )}.`,
      );
      return;
    }

    setGoals((current) =>
      current.map((item) =>
        item.id === goal.id
          ? { ...item, saved: item.saved + amount }
          : item,
      ),
    );

    setContributionOpen(false);
    setContributionError("");
  }

  function deleteGoal() {
    if (deleteId === null) return;

    setGoals((current) => current.filter((goal) => goal.id !== deleteId));
    setDeleteId(null);
  }

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId);
  const goalToDelete = goals.find((goal) => goal.id === deleteId);

  return (
    <main className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 size-4" />
            Create goal
          </Button>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total targets</p>
                <Target className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(summary.target)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Across {goals.length} goals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total saved</p>
                <PiggyBank className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(summary.saved)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.progress.toFixed(1)}% of total targets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <Wallet className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(summary.remaining)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Amount needed to complete all goals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Completed goals</p>
                <CircleCheck className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {summary.completed}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.active} goals still in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Overall progress */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-medium">Overall savings progress</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currency(summary.saved)} saved of {currency(summary.target)}
                </p>
              </div>
              <p className="text-sm font-semibold">
                {summary.progress.toFixed(1)}%
              </p>
            </div>

            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Overall savings progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(100, summary.progress)}
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, summary.progress)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Search and filters */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search financial goals..."
                className="pl-9"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter goals"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm sm:w-44"
            >
              <option value="all">All goals</option>
              <option value="active">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Your goals</h2>
            <p className="text-sm text-muted-foreground">
              {filteredGoals.length} goals
            </p>
          </div>

          {filteredGoals.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-background px-6 py-12 text-center">
              <Target className="mx-auto size-8 text-muted-foreground" />
              <h3 className="mt-3 font-medium">No goals found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another search or create a financial goal.
              </p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 size-4" />
                Create goal
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredGoals.map((goal) => {
                const Icon = categoryIcons[goal.category] ?? Target;
                const percentage = (goal.saved / goal.target) * 100;
                const remaining = Math.max(0, goal.target - goal.saved);
                const completed = remaining === 0;

                return (
                  <Card key={goal.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Icon className="size-5" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-medium">
                              {goal.name}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {goal.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {completed && (
                            <Badge variant="secondary">Completed</Badge>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0"
                                aria-label={`Actions for ${goal.name}`}
                              >
                                <Ellipsis className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(goal)}
                              >
                                <Pencil className="mr-2 size-4" />
                                Edit goal
                              </DropdownMenuItem>

                              {!completed && (
                                <DropdownMenuItem
                                  onClick={() => openContributionDialog(goal)}
                                >
                                  <Plus className="mr-2 size-4" />
                                  Add savings
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(goal.id)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete goal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {goal.description && (
                        <p className="mt-4 text-sm text-muted-foreground">
                          {goal.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Saved so far
                          </p>
                          <p className="mt-1 text-xl font-semibold">
                            {currency(goal.saved)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Target amount
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {currency(goal.target)}
                          </p>
                        </div>
                      </div>

                      <div
                        className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label={`${goal.name} progress`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(100, percentage)}
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, percentage)}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(0)}% completed
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {currency(remaining)} remaining
                        </span>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="size-3.5" />
                          Target: {formatDate(goal.targetDate)}
                        </div>

                        {!completed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openContributionDialog(goal)}
                          >
                            <Plus className="mr-1.5 size-3.5" />
                            Add savings
                          </Button>
                        )}

                        {completed && (
                          <span className="flex items-center gap-1 text-xs font-medium text-primary">
                            <CircleCheck className="size-4" />
                            Goal achieved
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Create / Edit Goal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit financial goal" : "Create financial goal"}
            </DialogTitle>
            <DialogDescription>
              Set a savings target and choose when you want to achieve it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal name</Label>
              <Input
                id="goalName"
                placeholder="e.g. Buy a new laptop"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalCategory">Category</Label>
              <select
                id="goalCategory"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goalTarget">Target amount (₹)</Label>
                <Input
                  id="goalTarget"
                  type="number"
                  min="1"
                  value={form.target}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      target: event.target.value,
                    }))
                  }
                  placeholder="50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalSaved">Already saved (₹)</Label>
                <Input
                  id="goalSaved"
                  type="number"
                  min="0"
                  value={form.saved}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      saved: event.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalDate">Target date (optional)</Label>
              <Input
                id="goalDate"
                type="date"
                value={form.targetDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    targetDate: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalDescription">Description (optional)</Label>
              <Input
                id="goalDescription"
                placeholder="What are you saving for?"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
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
            <Button onClick={saveGoal}>
              {editingId !== null ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Savings */}
      <Dialog open={contributionOpen} onOpenChange={setContributionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add savings</DialogTitle>
            <DialogDescription>
              Record a contribution towards your financial goal.
            </DialogDescription>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-4 py-2">
              <div className="rounded-md border p-4">
                <p className="font-medium">{selectedGoal.name}</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Saved</span>
                  <span>{currency(selectedGoal.saved)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">
                    {currency(selectedGoal.target - selectedGoal.saved)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributionAmount">
                  Contribution amount (₹)
                </Label>
                <Input
                  id="contributionAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={contribution}
                  onChange={(event) => {
                    setContribution(event.target.value);
                    setContributionError("");
                  }}
                  placeholder="Enter amount"
                />
              </div>

              {contributionError && (
                <p className="text-sm text-destructive" role="alert">
                  {contributionError}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setContributionOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addContribution}>
              Save contribution
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
            <DialogTitle>Delete goal?</DialogTitle>
            <DialogDescription>
              {goalToDelete
                ? `"${goalToDelete.name}" will be removed from your goals.`
                : "This goal will be removed."}{" "}
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
            <Button variant="destructive" onClick={deleteGoal}>
              <Trash2 className="mr-2 size-4" />
              Delete goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
