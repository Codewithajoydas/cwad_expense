import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react-native";
import {
  deleteTransaction,
  getAccounts,
  getAllTransactions,
  getCategories,
  updateTransaction,
  type Account as ApiAccount,
  type Category as ApiCategory,
  type Transaction as ApiTransaction,
} from "../../../lib/api-client";

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

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const emptyForm: TransactionForm = {
  title: "",
  type: "expense",
  amount: "",
  categoryId: "",
  accountId: "",
  toAccountId: "",
  date: today(),
  status: "completed",
  paymentMethod: "other",
  notes: "",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) => {
  if (!date) return "";
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const typeLabels: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
};

function ActionButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "danger" | "ghost";
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === "primary" && styles.primaryButton,
        variant === "outline" && styles.outlineButton,
        variant === "danger" && styles.dangerButton,
        variant === "ghost" && styles.ghostButton,
        disabled && styles.disabledButton,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "outline" && styles.outlineButtonText,
          variant === "ghost" && styles.ghostButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#8b8b95"
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={value} onValueChange={(v) => onValueChange(v as T)}>
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | TransactionType>("all");
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

  const loadTransactions = useCallback(async () => {
    try {
      setLoadError("");
      const [records, userAccounts, userCategories] = await Promise.all([
        getAllTransactions(),
        getAccounts(),
        getCategories(),
      ]);
      setAvailableAccounts(userAccounts);
      setAvailableCategories(userCategories);
      setTransactions(
        records.map((record: ApiTransaction) => {
          const fromAccount =
            typeof record.account === "string" ? record.account : record.account.name;
          const toAccount =
            typeof record.toAccount === "string"
              ? record.toAccount
              : record.toAccount?.name ?? "";
          const categoryName =
            typeof record.category === "string"
              ? record.category
              : record.category?.name ?? "";
          return {
            id: record._id,
            title: record.description || "Transaction",
            category:
              categoryName || (record.type === "transfer" ? "Transfer" : "Uncategorized"),
            categoryId:
              typeof record.category === "string"
                ? record.category
                : record.category?._id ?? "",
            account:
              record.type === "transfer" && toAccount
                ? `${fromAccount} → ${toAccount}`
                : fromAccount,
            accountId:
              typeof record.account === "string" ? record.account : record.account._id,
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
        }),
      );
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load transactions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const categories = useMemo(
    () =>
      [...new Map(
        transactions
          .filter((item) => item.categoryId)
          .map((item) => [item.categoryId, item.category]),
      ).entries()],
    [transactions],
  );

  const accounts = useMemo(
    () => [...new Map(transactions.map((item) => [item.accountId, item.account])).entries()],
    [transactions],
  );

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((item) => {
        const matchesSearch = [item.title, item.category, item.account, item.id]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        return (
          matchesSearch &&
          (type === "all" || item.type === type) &&
          (category === "all" || item.categoryId === category) &&
          (account === "all" || item.accountId === account) &&
          (!startDate || item.date >= startDate) &&
          (!endDate || item.date <= endDate)
        );
      }),
    [transactions, search, type, category, account, startDate, endDate],
  );

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize);

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

  const resetFilters = () => {
    setSearch("");
    setType("all");
    setCategory("all");
    setAccount("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const openEdit = (transaction: Transaction) => {
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
  };

  const saveTransaction = async () => {
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
      setActionError(
        error instanceof Error ? error.message : "Unable to update transaction.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeTransaction = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    setActionError("");
    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      await loadTransactions();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to delete transaction.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Transaction ID", "Title", "Type", "Category", "Account", "Date", "Amount"];
    const rows = filteredTransactions.map((item) => [
      item.id,
      item.title,
      item.type,
      item.category,
      item.account,
      item.date,
      String(item.amount),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    Alert.alert(
      "CSV prepared",
      "The CSV data is ready. To save or share it on a device, connect this action to expo-file-system and expo-sharing.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Show row count", onPress: () => Alert.alert("Transactions", `${rows.length} rows prepared.`) },
      ],
    );
    return csv;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const Icon =
      item.type === "income"
        ? ArrowDownLeft
        : item.type === "expense"
          ? ArrowUpRight
          : ArrowLeftRight;
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionTop}>
          <View style={styles.transactionIcon}>
            <Icon size={19} color="#52525b" />
          </View>
          <View style={styles.transactionTitleWrap}>
            <Text style={styles.transactionTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.mutedSmall} numberOfLines={1}>{item.category} · {formatDate(item.date)}</Text>
          </View>
          <Text
            style={[
              styles.amount,
              item.type === "income" && styles.incomeText,
              item.type === "expense" && styles.expenseText,
            ]}
          >
            {item.type === "income" ? "+" : item.type === "expense" ? "−" : ""}
            {formatCurrency(item.amount)}
          </Text>
        </View>
        <View style={styles.transactionMeta}>
          <Text style={styles.mutedSmall} numberOfLines={1}>{item.account}</Text>
          <View style={styles.row}>
            <Pressable style={styles.smallAction} onPress={() => openEdit(item)}>
              <Pencil size={15} color="#27272a" />
              <Text style={styles.smallActionText}>Edit</Text>
            </Pressable>
            <Pressable
              style={styles.smallAction}
              onPress={() => {
                setActionError("");
                setDeleteTarget(item);
              }}
            >
              <Trash2 size={15} color="#dc2626" />
              <Text style={[styles.smallActionText, styles.expenseText]}>Delete</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, item.type === "income" ? styles.incomeBadge : item.type === "expense" ? styles.expenseBadge : styles.transferBadge]}>
            {typeLabels[item.type]}
          </Text>
          <Text style={styles.mutedSmall}>ID: {item.id}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Transactions</Text>
            <Text style={styles.muted}>Manage your income, expenses, and transfers.</Text>
          </View>
          <View style={styles.headerActions}>
            <ActionButton label="Export CSV" variant="outline" onPress={exportCSV} />
            <ActionButton
              label="Add transaction"
              onPress={() => Alert.alert("Add transaction", "Connect this button to your create-transaction screen.")}
            />
          </View>
        </View>

        {!!loadError && <Text style={styles.errorText}>{loadError}</Text>}

        <View style={styles.summaryGrid}>
          <SummaryCard
            title="Total income"
            amount={totalIncome}
            count={filteredTransactions.filter((item) => item.type === "income").length}
            icon={<ArrowDownLeft size={19} color="#16a34a" />}
            amountStyle={styles.incomeText}
          />
          <SummaryCard
            title="Total expenses"
            amount={totalExpenses}
            count={filteredTransactions.filter((item) => item.type === "expense").length}
            icon={<ArrowUpRight size={19} color="#dc2626" />}
            amountStyle={styles.expenseText}
          />
          <SummaryCard
            title="Transfers"
            amount={totalTransfers}
            count={filteredTransactions.filter((item) => item.type === "transfer").length}
            icon={<ArrowLeftRight size={19} color="#52525b" />}
            amountStyle={undefined}
          />
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>All transactions</Text>
              <Text style={styles.muted}>{filteredTransactions.length} transactions found</Text>
            </View>
            <Pressable style={styles.filterButton} onPress={() => setShowFilters((value) => !value)}>
              <SlidersIcon />
              <Text style={styles.filterButtonText}>Filters{hasFilters ? " •" : ""}</Text>
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <Search size={18} color="#71717a" />
            <TextInput
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search transactions..."
              placeholderTextColor="#8b8b95"
              style={styles.searchInput}
              accessibilityLabel="Search transactions"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <X size={18} color="#71717a" />
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeTabs}>
            {(["all", "income", "expense", "transfer"] as const).map((value) => (
              <Pressable
                key={value}
                onPress={() => {
                  setType(value);
                  setPage(1);
                }}
                style={[styles.typeTab, type === value && styles.activeTypeTab]}
              >
                <Text style={[styles.typeTabText, type === value && styles.activeTypeTabText]}>
                  {value === "all" ? "All" : typeLabels[value]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {showFilters && (
            <View style={styles.filtersPanel}>
              <SelectField
                label="Category"
                value={category}
                onValueChange={(value) => {
                  setCategory(value);
                  setPage(1);
                }}
                options={[
                  { label: "All categories", value: "all" },
                  ...categories.map(([id, name]) => ({ label: name, value: id })),
                ]}
              />
              <SelectField
                label="Account"
                value={account}
                onValueChange={(value) => {
                  setAccount(value);
                  setPage(1);
                }}
                options={[
                  { label: "All accounts", value: "all" },
                  ...accounts.map(([id, name]) => ({ label: name, value: id })),
                ]}
              />
              <FormField label="From date (YYYY-MM-DD)" value={startDate} onChangeText={(value) => { setStartDate(value); setPage(1); }} placeholder="2026-01-01" />
              <FormField label="To date (YYYY-MM-DD)" value={endDate} onChangeText={(value) => { setEndDate(value); setPage(1); }} placeholder="2026-12-31" />
              {hasFilters && <ActionButton label="Clear all filters" variant="ghost" onPress={resetFilters} />}
            </View>
          )}

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color="#18181b" />
              <Text style={styles.muted}>Loading transactions...</Text>
            </View>
          ) : visibleTransactions.length === 0 ? (
            <View style={styles.centerState}>
              <Wallet size={28} color="#71717a" />
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.muted}>Try changing your search or filters.</Text>
              {hasFilters && <ActionButton label="Clear filters" variant="outline" onPress={resetFilters} />}
            </View>
          ) : (
            <FlatList
              data={visibleTransactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          )}

          <View style={styles.pagination}>
            <Text style={styles.mutedSmall}>
              {filteredTransactions.length === 0
                ? "No results"
                : `Showing ${startIndex + 1}–${Math.min(startIndex + pageSize, filteredTransactions.length)} of ${filteredTransactions.length}`}
            </Text>
            <View style={styles.row}>
              <Pressable
                style={[styles.pageButton, currentPage <= 1 && styles.disabledButton]}
                disabled={currentPage <= 1}
                onPress={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeft size={18} color="#27272a" />
              </Pressable>
              <Text style={styles.pageLabel}>Page {currentPage} of {totalPages}</Text>
              <Pressable
                style={[styles.pageButton, currentPage >= totalPages && styles.disabledButton]}
                disabled={currentPage >= totalPages}
                onPress={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                <ChevronRight size={18} color="#27272a" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={editing !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditing(null)}>
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Edit transaction</Text>
            <Text style={styles.muted}>Changes are saved to your account and balances are recalculated.</Text>
            <FormField label="Title" value={form.title} onChangeText={(value) => setForm({ ...form, title: value })} />
            <SelectField
              label="Type"
              value={form.type}
              onValueChange={(value) => setForm({ ...form, type: value, categoryId: "", toAccountId: "" })}
              options={[
                { label: "Expense", value: "expense" },
                { label: "Income", value: "income" },
                { label: "Transfer", value: "transfer" },
              ]}
            />
            <FormField label="Amount" value={form.amount} onChangeText={(value) => setForm({ ...form, amount: value })} keyboardType="decimal-pad" />
            <SelectField
              label={form.type === "transfer" ? "From account" : "Account"}
              value={form.accountId}
              onValueChange={(value) => setForm({ ...form, accountId: value })}
              options={[
                { label: "Select account", value: "" },
                ...availableAccounts.map((item) => ({ label: item.name, value: item._id })),
              ]}
            />
            {form.type === "transfer" ? (
              <SelectField
                label="To account"
                value={form.toAccountId}
                onValueChange={(value) => setForm({ ...form, toAccountId: value })}
                options={[
                  { label: "Select destination", value: "" },
                  ...availableAccounts.filter((item) => item._id !== form.accountId).map((item) => ({ label: item.name, value: item._id })),
                ]}
              />
            ) : (
              <SelectField
                label="Category"
                value={form.categoryId}
                onValueChange={(value) => setForm({ ...form, categoryId: value })}
                options={[
                  { label: "Select category", value: "" },
                  ...availableCategories.filter((item) => item.type === form.type).map((item) => ({ label: item.name, value: item._id })),
                ]}
              />
            )}
            <FormField label="Date (YYYY-MM-DD)" value={form.date} onChangeText={(value) => setForm({ ...form, date: value })} placeholder="2026-10-26" />
            <SelectField
              label="Status"
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value })}
              options={[
                { label: "Completed", value: "completed" },
                { label: "Pending", value: "pending" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
            <SelectField
              label="Payment method"
              value={form.paymentMethod}
              onValueChange={(value) => setForm({ ...form, paymentMethod: value })}
              options={[
                { label: "Other", value: "other" },
                { label: "Cash", value: "cash" },
                { label: "Card", value: "card" },
                { label: "Bank transfer", value: "bank_transfer" },
                { label: "UPI", value: "upi" },
              ]}
            />
            <FormField label="Notes" value={form.notes} onChangeText={(value) => setForm({ ...form, notes: value })} multiline />
            {!!actionError && <Text style={styles.errorText}>{actionError}</Text>}
            <View style={styles.modalActions}>
              <ActionButton label="Cancel" variant="outline" onPress={() => setEditing(null)} />
              <ActionButton label={isSaving ? "Saving..." : "Save changes"} onPress={saveTransaction} disabled={isSaving} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={deleteTarget !== null} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.overlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.modalTitle}>Delete transaction?</Text>
            <Text style={styles.muted}>
              This will permanently delete “{deleteTarget?.title}” and reverse its account balance changes.
            </Text>
            {!!actionError && <Text style={styles.errorText}>{actionError}</Text>}
            <View style={styles.modalActions}>
              <ActionButton label="Cancel" variant="outline" onPress={() => setDeleteTarget(null)} />
              <ActionButton label={isSaving ? "Deleting..." : "Delete"} variant="danger" onPress={removeTransaction} disabled={isSaving} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SummaryCard({
  title,
  amount,
  count,
  icon,
  amountStyle,
}: {
  title: string;
  amount: number;
  count: number;
  icon: React.ReactNode;
  amountStyle?: object;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <Text style={styles.summaryTitle}>{title}</Text>
        {icon}
      </View>
      <Text style={[styles.summaryAmount, amountStyle]}>{formatCurrency(amount)}</Text>
      <Text style={styles.mutedSmall}>{count} transactions</Text>
    </View>
  );
}

function SlidersIcon() {
  return <Filter size={16} color="#27272a" />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f7f8" },
  screen: { padding: 16, paddingBottom: 36, gap: 18 },
  header: { gap: 14 },
  headerActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  screenTitle: { fontSize: 26, fontWeight: "700", color: "#18181b" },
  muted: { color: "#71717a", fontSize: 13, lineHeight: 19 },
  mutedSmall: { color: "#71717a", fontSize: 11 },
  button: { minHeight: 40, paddingHorizontal: 13, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  primaryButton: { backgroundColor: "#18181b" },
  outlineButton: { borderWidth: 1, borderColor: "#d4d4d8", backgroundColor: "#fff" },
  dangerButton: { backgroundColor: "#dc2626" },
  ghostButton: { backgroundColor: "transparent" },
  disabledButton: { opacity: 0.45 },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  outlineButtonText: { color: "#27272a" },
  ghostButtonText: { color: "#27272a" },
  errorText: { color: "#dc2626", fontSize: 13, marginTop: 8 },
  summaryGrid: { gap: 10 },
  summaryCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e4e4e7", borderRadius: 14, padding: 16, gap: 9 },
  summaryTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryTitle: { color: "#71717a", fontSize: 13, fontWeight: "500" },
  summaryAmount: { fontSize: 24, fontWeight: "700", color: "#18181b" },
  incomeText: { color: "#15803d" },
  expenseText: { color: "#dc2626" },
  panel: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e4e4e7", borderRadius: 14, overflow: "hidden" },
  panelHeader: { padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: "#e4e4e7" },
  panelTitle: { color: "#18181b", fontSize: 17, fontWeight: "700", marginBottom: 4 },
  filterButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: "#d4d4d8" },
  filterButtonText: { color: "#27272a", fontSize: 13, fontWeight: "500" },
  searchWrap: { margin: 14, paddingHorizontal: 11, minHeight: 44, borderWidth: 1, borderColor: "#d4d4d8", borderRadius: 9, flexDirection: "row", alignItems: "center", gap: 9 },
  searchInput: { flex: 1, color: "#18181b", paddingVertical: 9, fontSize: 14 },
  typeTabs: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  typeTab: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 9, borderWidth: 1, borderColor: "#e4e4e7", backgroundColor: "#fff" },
  activeTypeTab: { backgroundColor: "#18181b", borderColor: "#18181b" },
  typeTabText: { color: "#52525b", fontSize: 13, fontWeight: "500" },
  activeTypeTabText: { color: "#fff" },
  filtersPanel: { padding: 14, borderTopWidth: 1, borderTopColor: "#e4e4e7", gap: 12, backgroundColor: "#fafafa" },
  field: { gap: 6 },
  label: { color: "#27272a", fontSize: 13, fontWeight: "600" },
  input: { minHeight: 44, borderWidth: 1, borderColor: "#d4d4d8", borderRadius: 9, paddingHorizontal: 12, color: "#18181b", backgroundColor: "#fff", fontSize: 14 },
  multilineInput: { minHeight: 90, paddingTop: 12 },
  pickerWrap: { borderWidth: 1, borderColor: "#d4d4d8", borderRadius: 9, backgroundColor: "#fff", overflow: "hidden" },
  centerState: { alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#18181b" },
  listContent: { paddingHorizontal: 12, gap: 10, paddingBottom: 12 },
  transactionCard: { borderWidth: 1, borderColor: "#e4e4e7", borderRadius: 12, padding: 12, gap: 12, backgroundColor: "#fff" },
  transactionTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  transactionIcon: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: "#e4e4e7", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" },
  transactionTitleWrap: { flex: 1, gap: 4 },
  transactionTitle: { color: "#18181b", fontSize: 14, fontWeight: "600" },
  amount: { color: "#18181b", fontSize: 13, fontWeight: "700" },
  transactionMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  smallAction: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 5, paddingHorizontal: 6 },
  smallActionText: { color: "#27272a", fontSize: 12, fontWeight: "500" },
  badgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  badge: { overflow: "hidden", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, fontSize: 11, fontWeight: "600" },
  incomeBadge: { color: "#15803d", backgroundColor: "#dcfce7" },
  expenseBadge: { color: "#be123c", backgroundColor: "#ffe4e6" },
  transferBadge: { color: "#52525b", backgroundColor: "#f4f4f5" },
  pagination: { padding: 14, borderTopWidth: 1, borderTopColor: "#e4e4e7", gap: 12 },
  pageButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#d4d4d8", borderRadius: 8 },
  pageLabel: { color: "#27272a", fontSize: 12 },
  modalSafe: { flex: 1, backgroundColor: "#fff" },
  modalContent: { padding: 20, paddingBottom: 40, gap: 15 },
  modalTitle: { color: "#18181b", fontSize: 21, fontWeight: "700" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 22 },
  confirmCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 14 },
});
