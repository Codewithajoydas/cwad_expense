
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Ellipsis,
  Filter,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteTransaction,
  getAccounts,
  getAllTransactions,
  getCategories,
  updateTransaction,
  type Account as ApiAccount,
  type Category as ApiCategory,
  type Transaction as ApiTransaction,
} from "@/lib/api-client";

type TransactionType = "income" | "expense" | "transfer";

type Transaction = {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  account: string;
  accountId: string;
  date: string;
  amount: number;
  type: TransactionType;
  toAccountId: string;
  status: ApiTransaction["status"];
  paymentMethod: ApiTransaction["paymentMethod"];
  notes: string;
};

type TransactionForm = {
  title: string;
  type: TransactionType;
  amount: string;
  categoryId: string;
  accountId: string;
  toAccountId: string;
  date: string;
  status: ApiTransaction["status"];
  paymentMethod: ApiTransaction["paymentMethod"];
  notes: string;
};

const emptyForm: TransactionForm = {
  title: "",
  type: "expense",
  amount: "",
  categoryId: "",
  accountId: "",
  toAccountId: "",
  date: new Date().toLocaleDateString("en-CA"),
  status: "completed",
  paymentMethod: "other",
  notes: "",
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (amount: number) => currency.format(amount);

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const typeConfig = {
  income: {
    label: "Income",
    icon: ArrowDownLeft,
    className:
      "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  expense: {
    label: "Expense",
    icon: ArrowUpRight,
    className:
      "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowLeftRight,
    className: "border-border bg-muted/60 text-muted-foreground",
  },
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [account, setAccount] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<ApiAccount[]>([]);
  const [availableCategories, setAvailableCategories] = useState<ApiCategory[]>([]);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const pageSize = 6;

  async function loadTransactions() {
    try {
      setLoadError("");
      const [records, userAccounts, userCategories] = await Promise.all([
        getAllTransactions(),
        getAccounts(),
        getCategories(),
      ]);
      setAvailableAccounts(userAccounts);
      setAvailableCategories(userCategories);
      setTransactions(records.map((record: ApiTransaction) => {
        const fromAccount = typeof record.account === "string" ? record.account : record.account.name;
        const toAccount =
          typeof record.toAccount === "string"
            ? record.toAccount
            : record.toAccount?.name ?? "";
        const categoryName = typeof record.category === "string" ? record.category : record.category?.name ?? "";
        return {
          id: record._id,
          title: record.description || "Transaction",
          category: categoryName || (record.type === "transfer" ? "Transfer" : "Uncategorized"),
          categoryId: typeof record.category === "string" ? record.category : record.category?._id ?? "",
          account: record.type === "transfer" && toAccount ? `${fromAccount} → ${toAccount}` : fromAccount,
          accountId: typeof record.account === "string" ? record.account : record.account._id,
          date: record.date.slice(0, 10),
          amount: record.amount,
          type: record.type,
          toAccountId:
            typeof record.toAccount === "string"
              ? record.toAccount
              : record.toAccount?._id ?? "",
          status: record.status,
          paymentMethod: record.paymentMethod,
          notes: record.notes ?? "",
        };
      }));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load transactions.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTransactions();
  }, []);

  const categories = useMemo(
    () => [...new Map(transactions.filter((item) => item.categoryId).map((item) => [item.categoryId, item.category])).entries()],
    [transactions]
  );

  const accounts = useMemo(
    () => [...new Map(transactions.map((item) => [item.accountId, item.account])).entries()],
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesSearch = [
        item.title,
        item.category,
        item.account,
        item.id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType = type === "all" || item.type === type;
      const matchesCategory =
        category === "all" || item.categoryId === category;
      const matchesAccount =
        account === "all" || item.accountId === account;
      const matchesStartDate = !startDate || item.date >= startDate;
      const matchesEndDate = !endDate || item.date <= endDate;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesAccount &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [
    transactions,
    search,
    type,
    category,
    account,
    startDate,
    endDate,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  const visibleTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + pageSize
  );

  const totalIncome = filteredTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalTransfers = filteredTransactions
    .filter((item) => item.type === "transfer")
    .reduce((sum, item) => sum + item.amount, 0);

  const hasFilters =
    search !== "" ||
    type !== "all" ||
    category !== "all" ||
    account !== "all" ||
    startDate !== "" ||
    endDate !== "";

  function resetFilters() {
    setSearch("");
    setType("all");
    setCategory("all");
    setAccount("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  function openEditDialog(transaction: Transaction) {
    setActionError("");
    setEditing(transaction);
    setForm({
      title: transaction.title === "Transaction" ? "" : transaction.title,
      type: transaction.type,
      amount: String(transaction.amount),
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      toAccountId: transaction.toAccountId,
      date: transaction.date,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
    });
  }

  async function saveTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError("Amount must be greater than zero.");
      return;
    }
    if (!form.accountId) {
      setActionError("Select an account.");
      return;
    }
    if (form.type === "transfer") {
      if (!form.toAccountId || form.toAccountId === form.accountId) {
        setActionError("Choose a different destination account.");
        return;
      }
    } else if (!form.categoryId) {
      setActionError("Select a category.");
      return;
    }
    if (!form.date) {
      setActionError("Select a transaction date.");
      return;
    }

    setIsSaving(true);
    setActionError("");
    try {
      await updateTransaction(editing.id, {
        type: form.type,
        amount,
        description: form.title.trim(),
        account: form.accountId,
        category: form.type === "transfer" ? null : form.categoryId,
        toAccount: form.type === "transfer" ? form.toAccountId : null,
        date: form.date,
        status: form.status,
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
      });
      setEditing(null);
      await loadTransactions();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update transaction.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeTransaction() {
    if (!deleteTarget) return;
    setIsSaving(true);
    setActionError("");
    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      await loadTransactions();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to delete transaction.");
    } finally {
      setIsSaving(false);
    }
  }

  function exportCSV() {
    const headers = [
      "Transaction ID",
      "Title",
      "Type",
      "Category",
      "Account",
      "Date",
      "Amount",
    ];

    const rows = filteredTransactions.map((item) => [
      item.id,
      item.title,
      item.type,
      item.category,
      item.account,
      item.date,
      item.amount,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "transactions.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360 space-y-7">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="size-4" />
              Export CSV
            </Button>

            <Button >
                <Plus className="size-4" />
              <a href="/create-expense">
                Add transaction
              </a>
            </Button>
          </div>
        </header>

        {loadError && <p role="alert" className="text-sm text-destructive">{loadError}</p>}

        {/* Summary */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="gap-3 py-5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total income
              </CardTitle>
              <ArrowDownLeft className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold tracking-tight">
                {formatCurrency(totalIncome)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {filteredTransactions.filter((item) => item.type === "income").length}{" "}
                income transactions
              </p>
            </CardContent>
          </Card>

          <Card className="gap-3 py-5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total expenses
              </CardTitle>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold tracking-tight">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {filteredTransactions.filter((item) => item.type === "expense").length}{" "}
                expense transactions
              </p>
            </CardContent>
          </Card>

          <Card className="gap-3 py-5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Transfers
              </CardTitle>
              <ArrowLeftRight className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold tracking-tight">
                {formatCurrency(totalTransfers)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {filteredTransactions.filter((item) => item.type === "transfer").length}{" "}
                transfer transactions
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Transaction List */}
        <Card className="gap-0 overflow-hidden py-0 shadow-none">
          <CardHeader className="gap-4 border-b px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  All transactions
                </CardTitle>
                <CardDescription className="mt-1">
                  {filteredTransactions.length} transactions found
                </CardDescription>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 self-start sm:self-auto"
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {hasFilters && (
                  <Badge variant="secondary" className="ml-1">
                    Active
                  </Badge>
                )}
              </Button>
            </div>

            {/* Search and Type Filters */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search transactions..."
                  className="h-10 pl-9"
                  aria-label="Search transactions"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex">
                {[
                  { label: "All", value: "all" },
                  { label: "Income", value: "income" },
                  { label: "Expenses", value: "expense" },
                  { label: "Transfers", value: "transfer" },
                ].map((item) => (
                  <Button
                    key={item.value}
                    variant={type === item.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setType(item.value);
                      setPage(1);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Category</label>
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      setCategory(value as string);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Account</label>
                  <Select
                    value={account}
                    onValueChange={(value) => {
                      setAccount(value as string);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="All accounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All accounts</SelectItem>
                      {accounts.map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="start-date" className="text-xs font-medium">
                    From date
                  </label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                      setPage(1);
                    }}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="end-date" className="text-xs font-medium">
                    To date
                  </label>
                  <Input
                    id="end-date"
                    type="date"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(event) => {
                      setEndDate(event.target.value);
                      setPage(1);
                    }}
                    className="bg-background"
                  />
                </div>

                {hasFilters && (
                  <div className="sm:col-span-2 xl:col-span-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="gap-2"
                    >
                      <X className="size-4" />
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-sm">
                <thead>
                  <tr className="border-b bg-muted/20 text-left text-xs text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Transaction</th>
                    <th className="px-4 py-4 font-medium">Category</th>
                    <th className="px-4 py-4 font-medium">Account</th>
                    <th className="px-4 py-4 font-medium">Date</th>
                    <th className="px-4 py-4 font-medium">Type</th>
                    <th className="px-4 py-4 text-right font-medium">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading transactions...</td></tr>
                  ) : visibleTransactions.map((item) => {
                    const config = typeConfig[item.type];
                    const Icon = config.icon;

                    return (
                      <tr
                        key={item.id}
                        className="border-b last:border-0 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                              <Icon className="size-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-muted-foreground">
                          {item.category}
                        </td>

                        <td className="px-4 py-4 text-muted-foreground">
                          {item.account}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                          {formatDate(item.date)}
                        </td>

                        <td className="px-4 py-4">
                          <Badge
                            variant="outline"
                            className={config.className}
                          >
                            {config.label}
                          </Badge>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                          <span
                            className={
                              item.type === "income"
                                ? "text-emerald-700 dark:text-emerald-400"
                                : ""
                            }
                          >
                            {item.type === "income"
                              ? "+"
                              : item.type === "expense"
                                ? "−"
                                : ""}
                            {formatCurrency(item.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              aria-label={`Edit ${item.title}`}
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              aria-label={`Delete ${item.title}`}
                              onClick={() => {
                                setActionError("");
                                setDeleteTarget(item);
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {visibleTransactions.length === 0 && (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                    <Wallet className="size-5 text-muted-foreground" />
                  </div>

                  <h3 className="font-semibold">No transactions found</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Try changing your search or filters to find a transaction.
                  </p>

                  {hasFilters && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={resetFilters}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.length === 0
                  ? "No results"
                  : `Showing ${startIndex + 1}–${Math.min(
                      startIndex + pageSize,
                      filteredTransactions.length
                    )} of ${filteredTransactions.length} transactions`}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <span className="min-w-16 text-center text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit transaction</DialogTitle>
            <DialogDescription>Changes are saved to your account and balances are recalculated.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveTransaction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-transaction-title" className="text-sm font-medium">Title</label>
              <Input
                id="edit-transaction-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                maxLength={200}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="edit-transaction-type" className="text-sm font-medium">Type</label>
                <select
                  id="edit-transaction-type"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.type}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      type: event.target.value as TransactionType,
                      categoryId: "",
                      toAccountId: "",
                    })
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-transaction-amount" className="text-sm font-medium">Amount</label>
                <Input
                  id="edit-transaction-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-transaction-account" className="text-sm font-medium">
                {form.type === "transfer" ? "From account" : "Account"}
              </label>
              <select
                id="edit-transaction-account"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.accountId}
                onChange={(event) => setForm({ ...form, accountId: event.target.value })}
                required
              >
                <option value="" disabled>Select account</option>
                {availableAccounts.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </div>
            {form.type === "transfer" ? (
              <div className="space-y-2">
                <label htmlFor="edit-transaction-to-account" className="text-sm font-medium">To account</label>
                <select
                  id="edit-transaction-to-account"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.toAccountId}
                  onChange={(event) => setForm({ ...form, toAccountId: event.target.value })}
                  required
                >
                  <option value="" disabled>Select destination</option>
                  {availableAccounts.map((item) => (
                    <option key={item._id} value={item._id} disabled={item._id === form.accountId}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="edit-transaction-category" className="text-sm font-medium">Category</label>
                <select
                  id="edit-transaction-category"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.categoryId}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {availableCategories
                    .filter((item) => item.type === form.type)
                    .map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                </select>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="edit-transaction-date" className="text-sm font-medium">Date</label>
                <Input
                  id="edit-transaction-date"
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-transaction-status" className="text-sm font-medium">Status</label>
                <select
                  id="edit-transaction-status"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as ApiTransaction["status"] })
                  }
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-transaction-notes" className="text-sm font-medium">Notes</label>
              <Input
                id="edit-transaction-notes"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                maxLength={2000}
              />
            </div>
            {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
            <DialogDescription>
              This will permanently delete “{deleteTarget?.title}” and reverse its account balance changes.
            </DialogDescription>
          </DialogHeader>
          {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={removeTransaction} disabled={isSaving}>
              <Trash2 className="mr-2 size-4" />
              {isSaving ? "Deleting..." : "Delete transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
