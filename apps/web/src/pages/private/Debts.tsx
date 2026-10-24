
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  CalendarDays,
  Ellipsis,
  Pencil,
  Trash2,
  Check,
  Clock,
  UserRound,
  Receipt,
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
import {
  createDebt as createDebtRecord,
  deleteDebt as deleteDebtRecord,
  getDebts,
  updateDebt as updateDebtRecord,
  type Debt as ApiDebt,
} from "@/lib/api-client";

type DebtType = "lent" | "borrowed";

type Debt = {
  id: string;
  person: string;
  type: DebtType;
  amount: number;
  paid: number;
  date: string;
  dueDate: string;
  note: string;
};

const today = new Date();

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (value: string) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
};

const initialForm = {
  person: "",
  type: "lent" as DebtType,
  amount: "",
  date: dateKey(today),
  dueDate: "",
  note: "",
};

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const [repaymentOpen, setRepaymentOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [repaymentError, setRepaymentError] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getDebts()
      .then((records) => {
        if (!active) return;
        setDebts(
          records.map((debt: ApiDebt) => ({
            id: debt._id,
            person: debt.person,
            type: debt.type,
            amount: debt.amount,
            paid: debt.paid,
            date: debt.date.slice(0, 10),
            dueDate: debt.dueDate?.slice(0, 10) ?? "",
            note: debt.note ?? "",
          })),
        );
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Unable to load debts.");
      });
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const lent = debts.filter((debt) => debt.type === "lent");
    const borrowed = debts.filter((debt) => debt.type === "borrowed");

    const receivable = lent.reduce(
      (sum, debt) => sum + Math.max(0, debt.amount - debt.paid),
      0,
    );

    const payable = borrowed.reduce(
      (sum, debt) => sum + Math.max(0, debt.amount - debt.paid),
      0,
    );

    const active = debts.filter((debt) => debt.paid < debt.amount).length;

    return {
      receivable,
      payable,
      netPosition: receivable - payable,
      active,
      total: debts.length,
    };
  }, [debts]);

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      const query = search.toLowerCase();

      const matchesSearch =
        debt.person.toLowerCase().includes(query) ||
        debt.note.toLowerCase().includes(query);

      const outstanding = debt.amount - debt.paid;

      const matchesFilter =
        filter === "all" ||
        (filter === "lent" && debt.type === "lent") ||
        (filter === "borrowed" && debt.type === "borrowed") ||
        (filter === "active" && outstanding > 0) ||
        (filter === "settled" && outstanding <= 0);

      return matchesSearch && matchesFilter;
    });
  }, [debts, search, filter]);

  function openCreateDialog() {
    setEditingId(null);
    setForm(initialForm);
    setFormError("");
    setFormOpen(true);
  }

  function openEditDialog(debt: Debt) {
    setEditingId(debt.id);
    setForm({
      person: debt.person,
      type: debt.type,
      amount: String(debt.amount),
      date: debt.date,
      dueDate: debt.dueDate,
      note: debt.note,
    });
    setFormError("");
    setFormOpen(true);
  }

  async function saveDebt() {
    const amount = Number(form.amount);

    if (!form.person.trim()) {
      setFormError("Please enter the person's name.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    if (!form.date) {
      setFormError("Please select the transaction date.");
      return;
    }

    const existingDebt =
      editingId === null
        ? undefined
        : debts.find((debt) => debt.id === editingId);

    if (existingDebt && amount < existingDebt.paid) {
      setFormError(
        `The amount cannot be less than the already recorded repayments (${currency(existingDebt.paid)}).`,
      );
      return;
    }

    const body = {
      person: form.person.trim(),
      type: form.type,
      amount,
      paid: existingDebt?.paid ?? 0,
      date: form.date,
      dueDate: form.dueDate,
      note: form.note.trim(),
    };

    try {
      const saved = editingId
        ? await updateDebtRecord(editingId, body)
        : await createDebtRecord(body);
      const updatedDebt: Debt = { ...body, id: saved._id };
      setDebts((current) =>
        editingId
          ? current.map((debt) => (debt.id === editingId ? updatedDebt : debt))
          : [updatedDebt, ...current],
      );
      setFormOpen(false);
      setFormError("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save debt.");
    }
  }

  function openRepaymentDialog(debt: Debt) {
    setSelectedDebtId(debt.id);
    setRepaymentAmount("");
    setRepaymentError("");
    setRepaymentOpen(true);
  }

  async function recordRepayment() {
    const debt = debts.find((item) => item.id === selectedDebtId);

    if (!debt) return;

    const outstanding = debt.amount - debt.paid;
    const amount = Number(repaymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setRepaymentError("Enter a valid repayment amount.");
      return;
    }

    if (amount > outstanding) {
      setRepaymentError(
        `Repayment cannot exceed the outstanding amount of ${currency(outstanding)}.`,
      );
      return;
    }

    try {
      const updated = await updateDebtRecord(debt.id, { paid: debt.paid + amount });
      setDebts((current) =>
        current.map((item) =>
          item.id === debt.id ? { ...item, paid: updated.paid } : item,
        ),
      );
      setRepaymentOpen(false);
      setRepaymentError("");
    } catch (error) {
      setRepaymentError(error instanceof Error ? error.message : "Unable to save repayment.");
    }
  }

  async function confirmDelete() {
    if (deleteId === null) return;

    try {
      await deleteDebtRecord(deleteId);
      setDebts((current) => current.filter((debt) => debt.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to delete debt.");
    }
  }

  function getDebtStatus(debt: Debt) {
    const outstanding = debt.amount - debt.paid;

    if (outstanding <= 0) {
      return {
        label: "Settled",
        className: "border-primary/30 text-primary",
      };
    }

    if (debt.dueDate && debt.dueDate < dateKey(today)) {
      return {
        label: "Overdue",
        className: "border-destructive/30 text-destructive",
      };
    }

    return {
      label: "Active",
      className: "border-border text-muted-foreground",
    };
  }

  const selectedDebt = debts.find(
    (debt) => debt.id === selectedDebtId,
  );

  const debtToDelete = debts.find((debt) => debt.id === deleteId);

  return (
    <main className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {loadError && (
          <p role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
            {loadError}
          </p>
        )}
        {/* Page header */}
        <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 size-4" />
            Add debt
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Money to receive
                </p>
                <ArrowDownLeft className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(summary.receivable)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Outstanding lent amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Money to pay
                </p>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {currency(summary.payable)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Outstanding borrowed amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Net position
                </p>
                <CircleDollarSign className="size-4 text-muted-foreground" />
              </div>
              <p
                className={`mt-3 text-2xl font-semibold ${
                  summary.netPosition < 0 ? "text-destructive" : ""
                }`}
              >
                {currency(summary.netPosition)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Receivable minus payable
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Active records
                </p>
                <HandCoins className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {summary.active}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Out of {summary.total} total records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by person or note..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter debts"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm sm:w-48"
            >
              <option value="all">All records</option>
              <option value="lent">Money lent</option>
              <option value="borrowed">Money borrowed</option>
              <option value="active">Active</option>
              <option value="settled">Settled</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">All debt records</h2>
            <p className="text-sm text-muted-foreground">
              {filteredDebts.length} records
            </p>
          </div>

          {/* Debt records */}
          {filteredDebts.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-background px-6 py-12 text-center">
              <HandCoins className="mx-auto size-8 text-muted-foreground" />
              <h3 className="mt-3 font-medium">No debts found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Change your filters or create a new debt record.
              </p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 size-4" />
                Add debt
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDebts.map((debt) => {
                const outstanding = debt.amount - debt.paid;
                const percentage = Math.min(
                  100,
                  (debt.paid / debt.amount) * 100,
                );
                const status = getDebtStatus(debt);
                const isLent = debt.type === "lent";

                return (
                  <Card key={debt.id}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          {isLent ? (
                            <ArrowDownLeft className="size-5" />
                          ) : (
                            <ArrowUpRight className="size-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{debt.person}</h3>
                            <Badge
                              variant="outline"
                              className={status.className}
                            >
                              {status.label}
                            </Badge>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {isLent ? "You lent money" : "You borrowed money"}
                            {debt.note ? ` · ${debt.note}` : ""}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Original amount
                              </p>
                              <p className="mt-1 text-sm font-medium">
                                {currency(debt.amount)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Repaid
                              </p>
                              <p className="mt-1 text-sm font-medium">
                                {currency(debt.paid)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Outstanding
                              </p>
                              <p className="mt-1 text-sm font-semibold">
                                {currency(outstanding)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Due date
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-sm">
                                <CalendarDays className="size-3.5 text-muted-foreground" />
                                {formatDate(debt.dueDate)}
                              </p>
                            </div>
                          </div>

                          {/* Repayment progress */}
                          <div className="mt-4">
                            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                              <span>Repayment progress</span>
                              <span>{percentage.toFixed(0)}%</span>
                            </div>

                            <div
                              className="h-1.5 overflow-hidden rounded-full bg-muted"
                              role="progressbar"
                              aria-label={`${debt.person} repayment progress`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={percentage}
                            >
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0"
                              aria-label={`Actions for ${debt.person}`}
                            >
                              <Ellipsis className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            {outstanding > 0 && (
                              <DropdownMenuItem
                                onClick={() => openRepaymentDialog(debt)}
                              >
                                <Check className="mr-2 size-4" />
                                Record repayment
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => openEditDialog(debt)}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit record
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(debt.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete record
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

        {/* Helpful note */}
        <div className="flex items-start gap-3 rounded-lg border bg-background p-4">
          <Receipt className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Keep your records updated</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Record every repayment to keep the outstanding balance accurate.
              These records are currently stored in page state only.
            </p>
          </div>
        </div>
      </div>

      {/* Create / Edit debt dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit debt record" : "Add debt record"}
            </DialogTitle>
            <DialogDescription>
              Enter the details of the money lent or borrowed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="debtPerson">Person or contact</Label>
              <Input
                id="debtPerson"
                placeholder="Enter person's name"
                value={form.person}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    person: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="debtType">Transaction type</Label>
              <select
                id="debtType"
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as DebtType,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="lent">Money lent — receive later</option>
                <option value="borrowed">Money borrowed — pay later</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="debtAmount">Amount (₹)</Label>
              <Input
                id="debtAmount"
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debtDate">Transaction date</Label>
                <Input
                  id="debtDate"
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="debtDueDate">Due date (optional)</Label>
                <Input
                  id="debtDueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="debtNote">Note (optional)</Label>
              <Input
                id="debtNote"
                placeholder="Reason or additional details"
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
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveDebt}>
              {editingId !== null ? "Save changes" : "Create record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record repayment dialog */}
      <Dialog open={repaymentOpen} onOpenChange={setRepaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record repayment</DialogTitle>
            <DialogDescription>
              Record money already received or paid against this debt.
            </DialogDescription>
          </DialogHeader>

          {selectedDebt && (
            <div className="space-y-4 py-2">
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-2">
                  <UserRound className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {selectedDebt.person}
                  </span>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    Original amount
                  </span>
                  <span>{currency(selectedDebt.amount)}</span>
                </div>

                <div className="mt-2 flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    Already repaid
                  </span>
                  <span>{currency(selectedDebt.paid)}</span>
                </div>

                <div className="mt-2 flex justify-between gap-3 text-sm font-semibold">
                  <span>Outstanding</span>
                  <span>
                    {currency(selectedDebt.amount - selectedDebt.paid)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repaymentAmount">Repayment amount (₹)</Label>
                <Input
                  id="repaymentAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={selectedDebt.amount - selectedDebt.paid}
                  placeholder="Enter amount"
                  value={repaymentAmount}
                  onChange={(event) => {
                    setRepaymentAmount(event.target.value);
                    setRepaymentError("");
                  }}
                />
              </div>

              {repaymentError && (
                <p className="text-sm text-destructive" role="alert">
                  {repaymentError}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRepaymentOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={recordRepayment}>
              <Check className="mr-2 size-4" />
              Save repayment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete debt record?</DialogTitle>
            <DialogDescription>
              {debtToDelete
                ? `The record for ${debtToDelete.person} will be removed from this page.`
                : "This record will be removed from this page."}
              {" "}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
