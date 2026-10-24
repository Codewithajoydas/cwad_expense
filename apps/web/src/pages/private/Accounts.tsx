import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Landmark,
  CreditCard,
  PiggyBank,
  Plus,
  Search,
  Ellipsis,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Building2,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  createAccount,
  deleteAccount as deleteAccountRequest,
  getAccounts,
  updateAccount,
  type Account as ApiAccount,
  type AccountType,
} from "@/lib/api-client";

type Account = {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  balance: number;
  currency: string;
  accountNumber: string;
  active: boolean;
  isDefault: boolean;
};

const fromApiAccount = (account: ApiAccount): Account => ({
  id: account._id,
  name: account.name,
  type: account.type,
  institution: account.institution || "Personal",
  balance: account.currentBalance,
  currency: account.currency,
  accountNumber: account.accountNumber || "Not provided",
  active: account.isActive,
  isDefault: account.isDefault,
});

const accountTypeOptions: {
  value: AccountType;
  label: string;
}[] = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank account" },
  { value: "savings", label: "Savings account" },
  { value: "credit_card", label: "Credit card" },
  { value: "wallet", label: "Wallet" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" },
];

const accountTypeConfig: Record<AccountType, { label: string; icon: typeof Wallet }> = {
  cash: { label: "Cash", icon: Banknote },
  bank: { label: "Bank account", icon: Landmark },
  savings: { label: "Savings", icon: PiggyBank },
  credit_card: { label: "Credit card", icon: CreditCard },
  wallet: { label: "Wallet", icon: Wallet },
  investment: { label: "Investment", icon: CircleDollarSign },
  other: { label: "Other", icon: Building2 },
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showBalances, setShowBalances] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formError, setFormError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  async function loadAccounts() {
    try {
      setLoadError("");
      setAccounts((await getAccounts()).map(fromApiAccount));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load accounts.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch = [account.name, account.institution, account.accountNumber]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType = filterType === "all" || account.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [accounts, search, filterType]);

  const totalAssets = accounts
    .filter((account) => account.type !== "credit_card" && account.active)
    .reduce((sum, account) => sum + account.balance, 0);

  const totalLiabilities = accounts
    .filter((account) => account.type === "credit_card" && account.active)
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);

  const netWorth = totalAssets - totalLiabilities;

  const activeAccounts = accounts.filter((account) => account.active).length;

  function resetForm() {
    setName("");
    setType("bank");
    setInstitution("");
    setBalance("");
    setAccountNumber("");
    setFormError("");
    setEditingAccount(null);
  }

  function openCreateDialog() {
    resetForm();
    setDialogOpen(true);
  }

  function openEditDialog(account: Account) {
    setEditingAccount(account);
    setName(account.name);
    setType(account.type);
    setInstitution(account.institution);
    setBalance("");
    setAccountNumber(account.accountNumber);
    setFormError("");
    setDialogOpen(true);
  }

  async function handleSaveAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const trimmedName = name.trim();
    const trimmedInstitution = institution.trim();
    const numericBalance = Number(balance);

    if (!trimmedName) {
      setFormError("Please enter an account name.");
      return;
    }

    if (!editingAccount && !Number.isFinite(numericBalance)) {
      setFormError("Please enter a valid account balance.");
      return;
    }

    const duplicate = accounts.some(
      (account) =>
        account.name.toLowerCase() === trimmedName.toLowerCase() &&
        account.id !== editingAccount?.id,
    );

    if (duplicate) {
      setFormError("An account with this name already exists.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, {
          name: trimmedName,
          type,
          institution: trimmedInstitution,
          accountNumber: accountNumber.trim() || null,
        });
      } else {
        await createAccount({
          name: trimmedName,
          type,
          openingBalance: numericBalance,
          institution: trimmedInstitution,
          accountNumber: accountNumber.trim() || null,
        });
      }
      await loadAccounts();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save account.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deleteTarget) return;
    try {
      await deleteAccountRequest(deleteTarget.id);
      setDeleteTarget(null);
      await loadAccounts();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to delete account.");
      setDeleteTarget(null);
    }
  }

  async function toggleAccountStatus(account: Account) {
    try {
      await updateAccount(account.id, { isActive: !account.active });
      await loadAccounts();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to update account.");
    }
  }

  function displayBalance(amount: number) {
    return showBalances ? formatCurrency(amount) : "••••••";
  }

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360 space-y-7">
        {/* Page Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowBalances((previous) => !previous)}>
              {showBalances ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showBalances ? "Hide balances" : "Show balances"}
            </Button>

            <Button onClick={openCreateDialog}>
              <Plus className="size-4" />
              Add account
            </Button>
          </div>
        </header>

        {loadError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </p>
        )}

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="gap-3 py-5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total assets
              </CardTitle>
              <Wallet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold tracking-tight">{displayBalance(totalAssets)}</p>
              <p className="mt-2 text-xs text-muted-foreground">Available non-credit balances</p>
            </CardContent>
          </Card>

          <Card className="gap-3 py-5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total liabilities
              </CardTitle>
              <CreditCard className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold tracking-tight">
                {displayBalance(totalLiabilities)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Outstanding credit balances</p>
            </CardContent>
          </Card>

          <Card className="gap-3 py-5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net worth</CardTitle>
              <CircleDollarSign className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold tracking-tight">{displayBalance(netWorth)}</p>
              <p className="mt-2 text-xs text-muted-foreground">Assets minus liabilities</p>
            </CardContent>
          </Card>

          <Card className="gap-3 py-5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active accounts
              </CardTitle>
              <CheckCircle2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold tracking-tight">{activeAccounts}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Out of {accounts.length} accounts
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Accounts List */}
        <Card className="gap-0 overflow-hidden py-0 shadow-none">
          <CardHeader className="gap-4 border-b px-5 py-5 sm:px-6">
            <div>
              <CardTitle className="text-base font-semibold">Your accounts</CardTitle>
              <CardDescription className="mt-1">
                View and manage your account details and balances.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search accounts..."
                  className="h-10 pl-9"
                  aria-label="Search accounts"
                />
              </div>
              {/* @ts-ignore */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-10 w-full sm:w-47.5">
                  <SelectValue placeholder="All account types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All account types</SelectItem>
                  {accountTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            {isLoading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Loading accounts...</p>
            ) : filteredAccounts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredAccounts.map((account) => {
                  const config = accountTypeConfig[account.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={account.id}
                      className={`rounded-xl border bg-background p-5 transition-colors hover:bg-muted/10 ${
                        !account.active ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/30">
                            <Icon className="size-5 text-muted-foreground" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold">{account.name}</h3>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {account.institution}
                            </p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0"
                              aria-label={`Actions for ${account.name}`}
                            >
                              <Ellipsis className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(account)}>
                              <Pencil className="mr-2 size-4" />
                              Edit account
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => void toggleAccountStatus(account)}>
                              {account.active ? "Deactivate account" : "Activate account"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(account)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-6 border-t pt-4">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {account.type === "credit_card"
                                ? "Outstanding balance"
                                : "Current balance"}
                            </p>
                            <p className="mt-1 text-2xl font-semibold tracking-tight">
                              {displayBalance(Math.abs(account.balance))}
                            </p>
                          </div>

                          <Badge
                            variant="outline"
                            className={
                              account.active
                                ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : ""
                            }
                          >
                            {account.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>{config.label}</span>
                          <span>{account.accountNumber}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                  <Wallet className="size-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">No accounts found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different search or account type.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setFilterType("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {filteredAccounts.length} of {accounts.length} accounts
              </p>

              <p className="text-xs text-muted-foreground">
                Balances are displayed in Indian Rupees (INR).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Create / Edit Account Dialog */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent>
            <form onSubmit={handleSaveAccount}>
              <DialogHeader>
                <DialogTitle>{editingAccount ? "Edit account" : "Add account"}</DialogTitle>
                <DialogDescription>
                  {editingAccount
                    ? "Update the details for this account."
                    : "Add an account to track its balance and transactions."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-5">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account name</Label>
                  <Input
                    id="account-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Primary Bank Account"
                    maxLength={80}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-type">Account type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => {
                      setType(value as AccountType);
                      setFormError("");
                    }}
                  >
                    <SelectTrigger id="account-type" className="w-full">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-institution">Bank or institution</Label>
                  <Input
                    id="account-institution"
                    value={institution}
                    onChange={(event) => setInstitution(event.target.value)}
                    placeholder="e.g. HDFC Bank"
                    maxLength={80}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-balance">
                    Opening balance
                  </Label>
                  <Input
                    id="account-balance"
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={(event) => setBalance(event.target.value)}
                    placeholder="0.00"
                    required={!editingAccount}
                    disabled={Boolean(editingAccount)}
                  />
                  {editingAccount ? (
                    <p className="text-xs text-muted-foreground">
                      Balances change through completed transactions and cannot be edited here.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Opening balance initializes the account balance.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-number">Account reference (Optional)</Label>
                  <Input
                    id="account-number"
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value)}
                    placeholder="e.g. •••• 4582"
                    maxLength={40}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use a masked reference only. Do not enter a PIN, CVV, or banking password.
                  </p>
                </div>

                {formError && (
                  <p role="alert" className="text-sm text-destructive">
                    {formError}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingAccount ? "Save changes" : "Create account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete account?</DialogTitle>
              <DialogDescription>
                You are about to delete{" "}
                <span className="font-medium text-foreground">{deleteTarget?.name}</span>. This
                This action cannot be undone. Accounts with transactions and the default account
                cannot be deleted; deactivate those accounts instead.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="mr-2 size-4" />
                Delete account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
