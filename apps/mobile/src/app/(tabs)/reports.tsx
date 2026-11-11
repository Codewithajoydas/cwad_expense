
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChartColumn,
  CircleDollarSign,
  Download,
  FileText,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react-native";

import {
  getAllTransactions,
  type Transaction as ApiTransaction,
} from "../../../lib/api-client";

type TransactionType = "income" | "expense";
type RangeType = "month" | "3months" | "6months" | "year" | "all";
type FilterType = "all" | TransactionType;

type Transaction = {
  id: string;
  title: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  account: string;
};

const COLORS = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  primary: "#2563EB",
  income: "#16A34A",
  expense: "#64748B",
  danger: "#DC2626",
  track: "#E2E8F0",
};

const RANGE_OPTIONS: { label: string; value: RangeType }[] = [
  { label: "This month", value: "month" },
  { label: "3 months", value: "3months" },
  { label: "6 months", value: "6months" },
  { label: "This year", value: "year" },
  { label: "All time", value: "all" },
];

const TYPE_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expenses", value: "expense" },
];

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonthKey = (date: string) => date.slice(0, 7);

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const compactCurrency = (amount: number) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${Math.round(amount)}`;
};

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getRangeStart(range: RangeType) {
  const now = new Date();

  const currentMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  if (range === "month") return dateKey(currentMonth);

  if (range === "3months") {
    return dateKey(
      new Date(now.getFullYear(), now.getMonth() - 2, 1)
    );
  }

  if (range === "6months") {
    return dateKey(
      new Date(now.getFullYear(), now.getMonth() - 5, 1)
    );
  }

  if (range === "year") {
    return `${now.getFullYear()}-01-01`;
  }

  return "";
}

function getLastSixMonths() {
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - 5 + index,
      1
    );

    return {
      key: `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("en-IN", {
        month: "short",
      }).format(date),
    };
  });
}

function getTransactionCategory(record: ApiTransaction) {
  const category = record.category;

  if (typeof category === "object" && category) {
    return category.name;
  }

  return "Uncategorized";
}

function getTransactionAccount(record: ApiTransaction) {
  const account = record.account;

  if (typeof account === "object" && account) {
    return account.name;
  }

  return "Account";
}

function Panel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

function SectionHeading({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.headingTitleRow}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {subtitle ? (
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.filterChip,
              selected && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                selected && styles.filterChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SummaryCard({
  title,
  amount,
  description,
  icon,
  negative = false,
}: {
  title: string;
  amount: string;
  description: string;
  icon: React.ReactNode;
  negative?: boolean;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryLabel}>{title}</Text>
        {icon}
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.summaryAmount,
          negative && styles.negativeText,
        ]}
      >
        {amount}
      </Text>

      <Text style={styles.summaryDescription}>{description}</Text>
    </View>
  );
}

function ProgressRow({
  label,
  amount,
  percentage,
  color = COLORS.primary,
}: {
  label: string;
  amount: string;
  percentage: number;
  color?: string;
}) {
  const safePercentage = Math.max(0, Math.min(percentage, 100));

  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel} numberOfLines={1}>
          {label}
        </Text>

        <View style={styles.progressAmountContainer}>
          <Text style={styles.progressAmount}>{amount}</Text>
          <Text style={styles.progressPercentage}>
            {percentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${safePercentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function Reports() {
  const [range, setRange] = useState<RangeType>("6months");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTransactions() {
      try {
        setLoading(true);
        setLoadError("");

        const records = await getAllTransactions();

        if (!active) return;

        const mappedTransactions: Transaction[] = records
          .filter(
            (
              record
            ): record is ApiTransaction & {
              type: TransactionType;
            } =>
              record.status === "completed" &&
              record.type !== "transfer"
          )
          .map((record) => ({
            id: record._id,
            title: record.description || record.type,
            category: getTransactionCategory(record),
            type: record.type,
            amount: Number(record.amount) || 0,
            date: record.date.slice(0, 10),
            account: getTransactionAccount(record),
          }));

        setTransactions(mappedTransactions);
      } catch (error: unknown) {
        if (!active) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load reports."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTransactions();

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
        typeFilter === "all" ||
        transaction.type === typeFilter;

      return matchesDate && matchesType;
    });
  }, [transactions, range, typeFilter]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = filteredTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expenses,
      savings: income - expenses,
      savingsRate:
        income > 0 ? ((income - expenses) / income) * 100 : 0,
      count: filteredTransactions.length,
      incomeCount: filteredTransactions.filter(
        (item) => item.type === "income"
      ).length,
      expenseCount: filteredTransactions.filter(
        (item) => item.type === "expense"
      ).length,
    };
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    return getLastSixMonths().map((month) => {
      const items = filteredTransactions.filter(
        (transaction) =>
          getMonthKey(transaction.date) === month.key
      );

      const income = items
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);

      const expenses = items
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

      return { ...month, income, expenses };
    });
  }, [filteredTransactions]);

  const maxMonthlyAmount = Math.max(
    1,
    ...monthlyData.flatMap((month) => [
      month.income,
      month.expenses,
    ])
  );

  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();

    filteredTransactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        totals.set(
          item.category,
          (totals.get(item.category) ?? 0) + item.amount
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
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        totals.set(
          item.account,
          (totals.get(item.account) ?? 0) + item.amount
        );
      });

    return Array.from(totals.entries())
      .map(([account, amount]) => ({
        account,
        amount,
        percentage:
          summary.expenses > 0
            ? (amount / summary.expenses) * 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, summary.expenses]);

  const recentTransactions = useMemo(
    () =>
      [...filteredTransactions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8),
    [filteredTransactions]
  );

  async function exportCSV() {
    if (exporting) return;

    setExporting(true);

    try {
      const headers = [
        "Date",
        "Title",
        "Category",
        "Type",
        "Amount",
        "Account",
      ];

      const escapeCSV = (value: string | number) =>
        `"${String(value).replace(/"/g, '""')}"`;

      const rows = filteredTransactions.map((transaction) => [
        transaction.date,
        transaction.title,
        transaction.category,
        transaction.type,
        transaction.amount,
        transaction.account,
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map(escapeCSV).join(","))
        .join("\r\n");

      const fileUri =
        `${FileSystem.cacheDirectory}cwad-expense-report.csv`;

      if (!fileUri) {
        throw new Error("Unable to create a temporary CSV file.");
      }

      await FileSystem.writeAsStringAsync(
        fileUri,
        "\uFEFF" + csv,
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export expense report",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        await Share.share({
          title: "Expense report CSV",
          message: `CSV report created at: ${fileUri}`,
        });
      }
    } catch (error: unknown) {
      Alert.alert(
        "Export failed",
        error instanceof Error
          ? error.message
          : "Unable to export the report."
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loadError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{loadError}</Text>
            <Pressable
              onPress={() => {
                // Remounting this screen or adding a retry function
                // can be used if you want an explicit retry button.
              }}
            >
              <Text style={styles.errorHint}>
                Check your connection and try again.
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.pageHeader}>
          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>Reports</Text>
            <Text style={styles.pageSubtitle}>
              Review your income and spending.
            </Text>
          </View>

          <Pressable
            onPress={exportCSV}
            disabled={exporting || loading}
            style={[
              styles.exportButton,
              (exporting || loading) && styles.disabledButton,
            ]}
          >
            {exporting ? (
              <ActivityIndicator color={COLORS.text} size="small" />
            ) : (
              <Download size={17} color={COLORS.text} />
            )}

            <Text style={styles.exportButtonText}>
              {exporting ? "Exporting" : "Export CSV"}
            </Text>
          </Pressable>
        </View>

        <Panel>
          <View style={styles.filterHeading}>
            <CalendarDays size={18} color={COLORS.muted} />
            <Text style={styles.filterTitle}>Report period</Text>
          </View>

          <FilterChips
            options={RANGE_OPTIONS}
            value={range}
            onChange={setRange}
          />

          <Text style={[styles.filterTitle, styles.typeFilterTitle]}>
            Transaction type
          </Text>

          <FilterChips
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={setTypeFilter}
          />
        </Panel>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              Loading financial reports...
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryGrid}>
              <SummaryCard
                title="Total income"
                amount={currency(summary.income)}
                description={`${summary.incomeCount} income records`}
                icon={
                  <TrendingUp size={19} color={COLORS.income} />
                }
              />

              <SummaryCard
                title="Total expenses"
                amount={currency(summary.expenses)}
                description={`${summary.expenseCount} expense records`}
                icon={
                  <TrendingDown size={19} color={COLORS.muted} />
                }
              />

              <SummaryCard
                title="Net savings"
                amount={currency(summary.savings)}
                description="Income minus expenses"
                negative={summary.savings < 0}
                icon={
                  <Wallet size={19} color={COLORS.muted} />
                }
              />

              <SummaryCard
                title="Savings rate"
                amount={`${summary.savingsRate.toFixed(1)}%`}
                description="Net savings as % of income"
                negative={summary.savingsRate < 0}
                icon={
                  <CircleDollarSign
                    size={19}
                    color={COLORS.muted}
                  />
                }
              />
            </View>

            <Panel>
              <SectionHeading
                title="Income vs. expenses"
                subtitle="Monthly comparison across the last six months."
              />

              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: COLORS.primary },
                    ]}
                  />
                  <Text style={styles.legendText}>Income</Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: COLORS.expense },
                    ]}
                  />
                  <Text style={styles.legendText}>Expenses</Text>
                </View>
              </View>

              <View style={styles.chartContainer}>
                <View style={styles.yAxis}>
                  {[1, 0.75, 0.5, 0.25, 0].map((fraction) => (
                    <Text key={fraction} style={styles.axisLabel}>
                      {compactCurrency(maxMonthlyAmount * fraction)}
                    </Text>
                  ))}
                </View>

                <View style={styles.chart}>
                  {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                    <View
                      key={fraction}
                      pointerEvents="none"
                      style={[
                        styles.gridLine,
                        { bottom: `${fraction * 100}%` },
                      ]}
                    />
                  ))}

                  {monthlyData.map((month) => (
                    <View key={month.key} style={styles.monthColumn}>
                      <View style={styles.barsArea}>
                        <View
                          style={[
                            styles.bar,
                            styles.incomeBar,
                            {
                              height: `${Math.max(
                                month.income > 0 ? 1 : 0,
                                (month.income / maxMonthlyAmount) * 100
                              )}%`,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.bar,
                            styles.expenseBar,
                            {
                              height: `${Math.max(
                                month.expenses > 0 ? 1 : 0,
                                (month.expenses / maxMonthlyAmount) * 100
                              )}%`,
                            },
                          ]}
                        />
                      </View>

                      <Text style={styles.monthLabel}>
                        {month.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.chartNote}>
                Values follow the selected filters. Months outside
                the selected date range may show zero.
              </Text>
            </Panel>

            <Panel>
              <SectionHeading
                title="Expenses by category"
                subtitle="See where your money is going."
                icon={
                  <ChartColumn
                    size={18}
                    color={COLORS.muted}
                  />
                }
              />

              {categoryData.length === 0 ? (
                <Text style={styles.emptyText}>
                  No expense data for this selection.
                </Text>
              ) : (
                <View style={styles.progressList}>
                  {categoryData.map((item) => (
                    <ProgressRow
                      key={item.category}
                      label={item.category}
                      amount={currency(item.amount)}
                      percentage={item.percentage}
                      color={COLORS.primary}
                    />
                  ))}
                </View>
              )}
            </Panel>

            <Panel>
              <SectionHeading
                title="Spending by account"
                subtitle="Expense totals grouped by payment account."
                icon={<Wallet size={18} color={COLORS.muted} />}
              />

              {accountData.length === 0 ? (
                <Text style={styles.emptyText}>
                  No account spending data for this selection.
                </Text>
              ) : (
                <View style={styles.progressList}>
                  {accountData.map((item) => (
                    <ProgressRow
                      key={item.account}
                      label={item.account}
                      amount={currency(item.amount)}
                      percentage={item.percentage}
                      color={COLORS.expense}
                    />
                  ))}
                </View>
              )}
            </Panel>

            <Panel style={styles.transactionsPanel}>
              <View style={styles.transactionHeader}>
                <View style={styles.headerText}>
                  <Text style={styles.sectionTitle}>
                    Transaction details
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Transactions included in this report.
                  </Text>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {summary.count}
                  </Text>
                </View>
              </View>

              {recentTransactions.length === 0 ? (
                <Text style={styles.emptyText}>
                  No transactions found for this report.
                </Text>
              ) : (
                <View>
                  {recentTransactions.map((transaction, index) => {
                    const isIncome = transaction.type === "income";

                    return (
                      <View
                        key={transaction.id}
                        style={[
                          styles.transactionRow,
                          index > 0 && styles.transactionBorder,
                        ]}
                      >
                        <View style={styles.transactionIcon}>
                          {isIncome ? (
                            <ArrowDownRight
                              size={20}
                              color={COLORS.income}
                            />
                          ) : (
                            <ArrowUpRight
                              size={20}
                              color={COLORS.text}
                            />
                          )}
                        </View>

                        <View style={styles.transactionInfo}>
                          <Text
                            numberOfLines={1}
                            style={styles.transactionTitle}
                          >
                            {transaction.title}
                          </Text>

                          <Text style={styles.transactionMeta}>
                            {transaction.category} ·{" "}
                            {formatDate(transaction.date)}
                          </Text>

                          <Text style={styles.transactionAccount}>
                            {transaction.account}
                          </Text>
                        </View>

                        <Text
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          style={[
                            styles.transactionAmount,
                            isIncome && styles.incomeText,
                          ]}
                        >
                          {isIncome ? "+" : "−"}
                          {currency(transaction.amount)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.exportFooter}>
                <View style={styles.exportFooterText}>
                  <FileText size={17} color={COLORS.muted} />
                  <Text style={styles.footerNote}>
                    CSV includes all transactions matching the filters.
                  </Text>
                </View>

                <Pressable
                  onPress={exportCSV}
                  disabled={exporting}
                  style={styles.secondaryExportButton}
                >
                  <Download size={16} color={COLORS.text} />
                  <Text style={styles.secondaryExportText}>
                    Export report
                  </Text>
                </Pressable>
              </View>
            </Panel>

            <View style={styles.reportNote}>
              <Receipt size={19} color={COLORS.muted} />

              <View style={styles.headerText}>
                <Text style={styles.reportNoteTitle}>
                  About these reports
                </Text>
                <Text style={styles.reportNoteText}>
                  Income, expenses, category totals and account totals
                  are calculated from transactions in the current
                  selection. Savings means income minus expenses; it
                  is not the same as your actual account balance.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
    gap: 16,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: COLORS.text,
  },
  pageSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
  },
  exportButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  disabledButton: {
    opacity: 0.55,
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
  },
  filterHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  typeFilterTitle: {
    marginTop: 16,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 4,
  },
  filterChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#EFF6FF",
  },
  filterChipText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "44%",
    minHeight: 125,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 13,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 12,
    color: COLORS.muted,
  },
  summaryAmount: {
    marginTop: 15,
    fontSize: 21,
    fontWeight: "700",
    color: COLORS.text,
  },
  summaryDescription: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.muted,
  },
  negativeText: {
    color: COLORS.danger,
  },
  incomeText: {
    color: COLORS.income,
  },
  sectionHeading: {
    gap: 5,
    marginBottom: 18,
  },
  headingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },
  legend: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 18,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.muted,
  },
  chartContainer: {
    height: 205,
    flexDirection: "row",
    gap: 8,
  },
  yAxis: {
    width: 57,
    justifyContent: "space-between",
    paddingBottom: 24,
  },
  axisLabel: {
    fontSize: 9,
    color: COLORS.muted,
    textAlign: "right",
  },
  chart: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "stretch",
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
  },
  monthColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 1,
  },
  barsArea: {
    width: "100%",
    height: "86%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 2,
  },
  bar: {
    width: "28%",
    minHeight: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  incomeBar: {
    backgroundColor: COLORS.primary,
  },
  expenseBar: {
    backgroundColor: COLORS.expense,
  },
  monthLabel: {
    height: 22,
    paddingTop: 6,
    fontSize: 9,
    color: COLORS.muted,
  },
  chartNote: {
    marginTop: 12,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.muted,
  },
  progressList: {
    gap: 20,
  },
  progressRow: {
    gap: 9,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  progressLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
  },
  progressAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  progressPercentage: {
    minWidth: 44,
    textAlign: "right",
    fontSize: 10,
    color: COLORS.muted,
  },
  progressTrack: {
    height: 7,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.track,
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
  },
  emptyText: {
    paddingVertical: 24,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },
  transactionsPanel: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    overflow: "hidden",
  },
  transactionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 7,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
  },
  transactionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  transactionBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  transactionIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  transactionMeta: {
    marginTop: 4,
    fontSize: 10,
    color: COLORS.muted,
  },
  transactionAccount: {
    marginTop: 3,
    fontSize: 10,
    color: COLORS.muted,
  },
  transactionAmount: {
    maxWidth: 115,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "right",
  },
  exportFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 14,
  },
  exportFooterText: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  footerNote: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },
  secondaryExportButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  secondaryExportText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  reportNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  reportNoteTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },
  reportNoteText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: COLORS.muted,
  },
  loadingBox: {
    paddingVertical: 45,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  errorBox: {
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.danger,
  },
  errorHint: {
    fontSize: 12,
    color: COLORS.muted,
  },
});
