import { useEffect, useState } from "react";
import { ArrowLeftRight, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateExpenseForm from "@/components/create-expense-form";
import CreateIncomeForm from "@/components/create-income-form";
import CreateTransferForm from "@/components/create-transfer-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  deleteTransaction,
  getAccounts,
  getAllTransactions,
  updateTransaction,
  type Account,
  type Transaction as ApiTransaction,
} from "@/lib/api-client";

type TransferRecord = {
  id: string;
  description: string;
  amount: number;
  accountId: string;
  accountName: string;
  toAccountId: string;
  toAccountName: string;
  date: string;
};

type TransferForm = {
  description: string;
  amount: string;
  accountId: string;
  toAccountId: string;
  date: string;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const getId = (value: string | Account | null | undefined) =>
  typeof value === "string" ? value : value?._id ?? "";

const getName = (value: string | Account | null | undefined) =>
  typeof value === "string" ? value : value?.name ?? "Account";

const emptyForm: TransferForm = {
  description: "",
  amount: "",
  accountId: "",
  toAccountId: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function Transfers() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<TransferRecord | null>(null);
  const [form, setForm] = useState<TransferForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<TransferRecord | null>(null);

  async function loadTransfers() {
    try {
      setLoadError("");
      const [records, userAccounts] = await Promise.all([
        getAllTransactions({ type: "transfer" }),
        getAccounts({ isActive: true }),
      ]);
      setAccounts(userAccounts);
      setTransfers(
        records.map((record: ApiTransaction) => ({
          id: record._id,
          description: record.description || record.notes || "Transfer",
          amount: record.amount,
          accountId: getId(record.account),
          accountName: getName(record.account),
          toAccountId: getId(record.toAccount),
          toAccountName: getName(record.toAccount),
          date: record.date.slice(0, 10),
        })),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load transfers.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTransfers();
  }, []);

  function openEditDialog(transfer: TransferRecord) {
    setActionError("");
    setEditing(transfer);
    setForm({
      description: transfer.description,
      amount: String(transfer.amount),
      accountId: transfer.accountId,
      toAccountId: transfer.toAccountId,
      date: transfer.date,
    });
  }

  async function saveTransfer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError("Amount must be greater than zero.");
      return;
    }
    if (!form.accountId || !form.toAccountId || form.accountId === form.toAccountId) {
      setActionError("Choose two different accounts for the transfer.");
      return;
    }
    if (!form.date) {
      setActionError("Choose a transfer date.");
      return;
    }

    setIsSaving(true);
    setActionError("");
    try {
      await updateTransaction(editing.id, {
        type: "transfer",
        amount,
        description: form.description.trim(),
        account: form.accountId,
        toAccount: form.toAccountId,
        date: form.date,
      });
      setEditing(null);
      await loadTransfers();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update transfer.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeTransfer() {
    if (!deleteTarget) return;
    setIsSaving(true);
    setActionError("");
    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      await loadTransfers();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to delete transfer.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-6">
      <Tabs defaultValue="transfer" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="pt-4">
          <CreateExpenseForm />
        </TabsContent>

        <TabsContent value="income" className="pt-4">
          <CreateIncomeForm />
        </TabsContent>

        <TabsContent value="transfer" className="pt-4">
          <CreateTransferForm onCreated={() => void loadTransfers()} />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Transfer history</CardTitle>
          <CardDescription>Edit or delete a saved transfer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadError && (
            <p role="alert" className="text-sm text-destructive">
              {loadError}
            </p>
          )}
          {actionError && !editing && !deleteTarget && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}
          {isLoading ? (
            <p role="status" className="text-sm text-muted-foreground">Loading transfers...</p>
          ) : transfers.length === 0 ? (
            <p className="py-5 text-center text-sm text-muted-foreground">
              No transfers recorded yet.
            </p>
          ) : (
            transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <ArrowLeftRight className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{transfer.description}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {transfer.accountName} → {transfer.toAccountName} · {transfer.date}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{formatCurrency(transfer.amount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(transfer)}
                    aria-label={`Edit ${transfer.description}`}
                  >
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setActionError("");
                      setDeleteTarget(transfer);
                    }}
                    aria-label={`Delete ${transfer.description}`}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit transfer</DialogTitle>
            <DialogDescription>Update the transfer details and account balances.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveTransfer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transferDescription">Description</Label>
              <Input
                id="transferDescription"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferAmount">Amount</Label>
              <Input
                id="transferAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transferFrom">From account</Label>
                <select
                  id="transferFrom"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.accountId}
                  onChange={(event) => setForm({ ...form, accountId: event.target.value })}
                  required
                >
                  <option value="" disabled>Select account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>{account.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferTo">To account</Label>
                <select
                  id="transferTo"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.toAccountId}
                  onChange={(event) => setForm({ ...form, toAccountId: event.target.value })}
                  required
                >
                  <option value="" disabled>Select account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>{account.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferDate">Date</Label>
              <Input
                id="transferDate"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                required
              />
            </div>
            {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete transfer?</DialogTitle>
            <DialogDescription>
              This will remove “{deleteTarget?.description}” and reverse its account balance changes.
            </DialogDescription>
          </DialogHeader>
          {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={removeTransfer} disabled={isSaving}>
              <Trash2 className="mr-2 size-4" />
              {isSaving ? "Deleting..." : "Delete transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
