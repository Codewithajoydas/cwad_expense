import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  getAccounts,
  getAllTransactions,
  type Account,
  type Transaction as ApiTransaction,
} from "../../../lib/api-client";

type TransactionType = "income" | "expense" | "transfer";

type DashboardTransaction = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: TransactionType;
  icon: keyof typeof Ionicons.glyphMap;
};

type StatCardProps = {
  title: string;
  amount: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  trend: string;
  trendType: "positive" | "negative" | "neutral";
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return currency.format(amount);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatCurrentMonth() {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function StatCard({
  title,
  amount,
  description,
  icon,
  trend,
  trendType,
}: StatCardProps) {
  const trendStyle =
    trendType === "positive"
      ? styles.trendPositive
      : trendType === "negative"
        ? styles.trendNegative
        : styles.trendNeutral;

  return (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <Text style={styles.statTitle} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.statIcon}>
          <Ionicons name={icon} size={18} color="#6b7280" />
        </View>
      </View>

      <Text
        style={styles.statAmount}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {amount}
      </Text>

      <View style={styles.statFooter}>
        <View style={[styles.trendBadge, trendStyle]}>
          <Text style={styles.trendText}>{trend}</Text>
        </View>

        <Text style={styles.statDescription}>{description}</Text>
      </View>
    </View>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingText}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {description ? (
          <Text style={styles.sectionDescription}>{description}</Text>
        ) : null}
      </View>

      {action}
    </View>
  );
}

function SmallAction({
  icon,
  onPress,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.smallAction}
    >
      <Ionicons name={icon} size={20} color="#6b7280" />
    </Pressable>
  );
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const currentMonthKey = monthKey(new Date());

  useEffect(() => {
    let active = true;

    Promise.all([
      getAllTransactions(),
      getAccounts({ isActive: true }),
    ])
      .then(([records, userAccounts]) => {
        if (!active) return;

        const mappedTransactions: DashboardTransaction[] = records
          .filter((record) => record.status === "completed")
          .map((record: ApiTransaction) => ({
            id: record._id,
            title: record.description || record.type,
            category:
              typeof record.category === "object" && record.category
                ? record.category.name
                : "Uncategorized",
            date: record.date.slice(0, 10),
            amount: record.amount,
            type: record.type,
            icon:
              record.type === "income"
                ? "arrow-down-circle-outline"
                : record.type === "transfer"
                  ? "swap-horizontal-outline"
                  : "arrow-up-circle-outline",
          }));

        setTransactions(mappedTransactions);
        setAccounts(userAccounts);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load dashboard data.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const currentMonthTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        transaction.date.startsWith(currentMonthKey),
      ),
    [transactions, currentMonthKey],
  );

  const totalIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.currentBalance,
    0,
  );

  const savings = totalIncome - totalExpenses;

  const monthlyData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - 5 + index);

        const key = monthKey(date);

        const records = transactions.filter((transaction) =>
          transaction.date.startsWith(key),
        );

        return {
          month: date.toLocaleDateString("en-IN", {
            month: "short",
          }),
          income: records
            .filter((transaction) => transaction.type === "income")
            .reduce((sum, transaction) => sum + transaction.amount, 0),
          expense: records
            .filter((transaction) => transaction.type === "expense")
            .reduce((sum, transaction) => sum + transaction.amount, 0),
        };
      }),
    [transactions],
  );

  const spendingCategories = useMemo(() => {
    const totals = new Map<string, number>();

    currentMonthTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        totals.set(
          transaction.category,
          (totals.get(transaction.category) ?? 0) + transaction.amount,
        );
      });

    return Array.from(totals.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage:
          totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthTransactions, totalExpenses]);

  const maxMonthlyValue = Math.max(
    1,
    ...monthlyData.map((item) => Math.max(item.income, item.expense)),
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageContent}>
        {loadError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#111827" />
            <Text style={styles.mutedText}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              {/* <View style={styles.headerText}>
                <Text style={styles.pageTitle}>Dashboard</Text>
                <Text style={styles.sectionDescription}>
                  Your financial overview
                </Text>
              </View> */}

              <View style={styles.headerActions}>
                <View style={styles.monthBadge}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#6b7280"
                  />
                  <Text style={styles.monthText}>
                    {formatCurrentMonth()}
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.push("/create-expense" as never)}
                  style={styles.primaryButton}
                >
                  <Ionicons name="add" size={18} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>
                    Add transaction
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Summary cards: two columns */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Total balance"
                amount={formatCurrency(totalBalance)}
                description="Across all accounts"
                icon="wallet-outline"
                trend="Available"
                trendType="neutral"
              />

              <StatCard
                title="Total income"
                amount={formatCurrency(totalIncome)}
                description="This month"
                icon="arrow-down-circle-outline"
                trend="+12.5%"
                trendType="positive"
              />

              <StatCard
                title="Total expenses"
                amount={formatCurrency(totalExpenses)}
                description="This month"
                icon="arrow-up-circle-outline"
                trend="+4.2%"
                trendType="negative"
              />

              <StatCard
                title="Net savings"
                amount={formatCurrency(savings)}
                description="Income minus expenses"
                icon="trending-up-outline"
                trend="55.6% saved"
                trendType="positive"
              />
            </View>

            {/* Cash flow */}
            <View style={styles.sectionCard}>
              <SectionHeading
                title="Cash flow"
                description="Income vs expenses over the last six months"
                action={
                  <SmallAction
                    icon="ellipsis-horizontal"
                    label="Cash flow options"
                    onPress={() => {}}
                  />
                }
              />

              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={styles.incomeLegend} />
                  <Text style={styles.legendText}>Income</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.expenseLegend} />
                  <Text style={styles.legendText}>Expenses</Text>
                </View>
              </View>

              <View style={styles.chart}>
                {monthlyData.map((item, index) => (
                  <View
                    key={`${item.month}-${index}`}
                    style={styles.chartColumn}
                  >
                    <View style={styles.chartBars}>
                      <View
                        style={[
                          styles.incomeBar,
                          {
                            height: `${
                              (item.income / maxMonthlyValue) * 100
                            }%`,
                          },
                        ]}
                      />

                      <View
                        style={[
                          styles.expenseBar,
                          {
                            height: `${
                              (item.expense / maxMonthlyValue) * 100
                            }%`,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.chartMonth}>{item.month}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cashFlowSummary}>
                <View>
                  <Text style={styles.mutedText}>This month income</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(totalIncome)}
                  </Text>
                </View>

                <View>
                  <Text style={styles.mutedText}>This month expenses</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(totalExpenses)}
                  </Text>
                </View>

                <View>
                  <Text style={styles.mutedText}>Net cash flow</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(savings)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Spending breakdown */}
            <View style={styles.sectionCard}>
              <SectionHeading
                title="Spending breakdown"
                description="Where your money goes this month"
              />

              <Text style={styles.largeAmount}>
                {formatCurrency(totalExpenses)}
              </Text>
              <Text style={styles.mutedText}>
                Total categorized expenses
              </Text>

              <View style={styles.categoryBar}>
                {spendingCategories.map((item, index) => (
                  <View
                    key={item.name}
                    style={[
                      index % 2 === 0
                        ? styles.categoryDark
                        : styles.categoryLight,
                      { width: `${item.percentage}%` },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.categoryList}>
                {spendingCategories.length === 0 ? (
                  <Text style={styles.mutedText}>
                    No expenses recorded this month.
                  </Text>
                ) : (
                  spendingCategories.map((item) => (
                    <View key={item.name} style={styles.categoryItem}>
                      <View style={styles.categoryItemHeader}>
                        <View style={styles.categoryName}>
                          <Ionicons
                            name="cash-outline"
                            size={17}
                            color="#6b7280"
                          />
                          <Text
                            numberOfLines={1}
                            style={styles.categoryLabel}
                          >
                            {item.name}
                          </Text>
                        </View>

                        <Text style={styles.rowAmount}>
                          {formatCurrency(item.amount)}
                        </Text>
                      </View>

                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${item.percentage}%` },
                          ]}
                        />
                      </View>

                      <Text style={styles.percentageText}>
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* Accounts */}
            <View style={styles.sectionCard}>
              <SectionHeading
                title="My accounts"
                description="Your available balances"
                action={
                  <SmallAction
                    icon="ellipsis-horizontal"
                    label="Account options"
                    onPress={() => {}}
                  />
                }
              />

              {accounts.length === 0 ? (
                <Text style={styles.emptyText}>
                  No active accounts found.
                </Text>
              ) : (
                <View style={styles.accountList}>
                  {accounts.map((account) => (
                    <View key={account._id} style={styles.accountRow}>
                      <View style={styles.accountInfo}>
                        <View style={styles.accountIcon}>
                          <Ionicons
                            name={
                              account.type === "cash" ||
                              account.type === "wallet"
                                ? "wallet-outline"
                                : "card-outline"
                            }
                            size={18}
                            color="#6b7280"
                          />
                        </View>

                        <View style={styles.accountDetails}>
                          <Text
                            numberOfLines={1}
                            style={styles.rowTitle}
                          >
                            {account.name}
                          </Text>
                          <Text style={styles.smallMutedText}>
                            {account.type.replace("_", " ")}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.accountBalance}>
                        {formatCurrency(account.currentBalance)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.mutedText}>Total balance</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(totalBalance)}
                </Text>
              </View>
            </View>

            {/* Recent transactions */}
            <View style={styles.sectionCard}>
              <SectionHeading
                title="Recent transactions"
                description="A summary of your latest activity"
                action={
                  <Pressable
                    onPress={() => router.push("/transactions" as never)}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>View all</Text>
                  </Pressable>
                }
              />

              {transactions.length === 0 ? (
                <Text style={styles.emptyText}>No transactions found.</Text>
              ) : (
                <View style={styles.transactionList}>
                  {transactions.slice(0, 6).map((transaction) => {
                    const isIncome = transaction.type === "income";
                    const isTransfer = transaction.type === "transfer";

                    return (
                      <View
                        key={transaction.id}
                        style={styles.transactionRow}
                      >
                        <View style={styles.transactionInfo}>
                          <View style={styles.transactionIcon}>
                            <Ionicons
                              name={transaction.icon}
                              size={18}
                              color="#6b7280"
                            />
                          </View>

                          <View style={styles.transactionDetails}>
                            <Text
                              numberOfLines={1}
                              style={styles.rowTitle}
                            >
                              {transaction.title}
                            </Text>

                            <Text
                              numberOfLines={1}
                              style={styles.smallMutedText}
                            >
                              {transaction.category} · {transaction.date}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.transactionAmountBox}>
                          <Text
                            style={[
                              styles.transactionAmount,
                              isIncome && styles.incomeText,
                            ]}
                          >
                            {isIncome ? "+" : isTransfer ? "" : "−"}
                            {formatCurrency(transaction.amount)}
                          </Text>

                          <Text style={styles.smallMutedText}>
                            {transaction.type}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Savings insight */}
            <View style={styles.sectionCard}>
              <View style={styles.insightRow}>
                <View style={styles.insightIcon}>
                  <Ionicons
                    name="trending-up-outline"
                    size={20}
                    color="#6b7280"
                  />
                </View>

                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>
                    Your monthly savings
                  </Text>

                  <Text style={styles.sectionDescription}>
                    You have retained{" "}
                    <Text style={styles.inlineStrong}>
                      {formatCurrency(savings)}
                    </Text>{" "}
                    from this month's income.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.push("/create-expense" as never)}
                style={styles.outlineButton}
              >
                <Text style={styles.outlineButtonText}>
                  Add transaction
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 32,
  },

  pageContent: {
    gap: 24,
  },

  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  headerText: {
    flex: 1,
    minWidth: 140,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#030712",
  },

  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },

  monthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  monthText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    backgroundColor: "#030712",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  primaryButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#ffffff",
  },

  // Two-column responsive card grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  statCard: {
    width: "48%",
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 12,
  },

  statCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 12,
  },

  statTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    color: "#6b7280",
  },

  statIcon: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },

  statAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#030712",
  },

  statFooter: {
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
  },

  trendBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  trendPositive: {
    borderColor: "#a7f3d0",
    backgroundColor: "#ecfdf5",
  },

  trendNegative: {
    borderColor: "#fecdd3",
    backgroundColor: "#fff1f2",
  },

  trendNeutral: {
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },

  trendText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#374151",
  },

  statDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: "#6b7280",
  },

  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 16,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },

  sectionHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#030712",
  },

  sectionDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7280",
  },

  smallAction: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },

  chartLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  incomeLegend: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#111827",
  },

  expenseLegend: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
  },

  legendText: {
    fontSize: 12,
    color: "#4b5563",
  },

  chart: {
    height: 200,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: 8,
  },

  chartColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  chartBars: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },

  incomeBar: {
    width: "35%",
    minHeight: 2,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: "#111827",
  },

  expenseBar: {
    width: "35%",
    minHeight: 2,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: "#d1d5db",
  },

  chartMonth: {
    marginTop: 8,
    fontSize: 11,
    textAlign: "center",
    color: "#6b7280",
  },

  cashFlowSummary: {
    gap: 16,
    marginTop: 20,
  },

  summaryValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "600",
    color: "#030712",
  },

  largeAmount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#030712",
  },

  mutedText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7280",
  },

  categoryBar: {
    height: 8,
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    marginTop: 16,
  },

  categoryDark: {
    height: "100%",
    backgroundColor: "#111827",
  },

  categoryLight: {
    height: "100%",
    backgroundColor: "#9ca3af",
  },

  categoryList: {
    gap: 20,
    marginTop: 20,
  },

  categoryItem: {
    gap: 8,
  },

  categoryItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  categoryName: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  categoryLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: "#374151",
  },

  rowAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  progressTrack: {
    height: 6,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#111827",
  },

  percentageText: {
    fontSize: 12,
    textAlign: "right",
    color: "#6b7280",
  },

  accountList: {
    gap: 12,
  },

  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
  },

  accountInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  accountIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },

  accountDetails: {
    flex: 1,
    minWidth: 0,
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  smallMutedText: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },

  accountBalance: {
    flexShrink: 0,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    color: "#030712",
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  totalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#030712",
  },

  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  secondaryButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },

  transactionList: {
    gap: 4,
  },

  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
  },

  transactionInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  transactionIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },

  transactionDetails: {
    flex: 1,
    minWidth: 0,
  },

  transactionAmountBox: {
    flexShrink: 0,
    alignItems: "flex-end",
  },

  transactionAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  incomeText: {
    color: "#047857",
  },

  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  insightIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },

  insightContent: {
    flex: 1,
    minWidth: 0,
  },

  insightTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#030712",
  },

  inlineStrong: {
    fontWeight: "600",
    color: "#111827",
  },

  outlineButton: {
    alignSelf: "flex-start",
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  outlineButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },

  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingVertical: 40,
  },

  errorBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    padding: 12,
  },

  errorText: {
    fontSize: 14,
    color: "#b91c1c",
  },

  emptyText: {
    paddingVertical: 16,
    fontSize: 14,
    color: "#6b7280",
  },
});