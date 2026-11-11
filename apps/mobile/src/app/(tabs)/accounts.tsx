import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  createAccount,
  deleteAccount as deleteAccountRequest,
  getAccounts,
  updateAccount,
  type Account as ApiAccount,
  type AccountType,
} from "../../../lib/api-client";





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

type AccountTypeOption = {
  value: AccountType | "all";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const accountTypeOptions: AccountTypeOption[] = [
  { value: "all", label: "All account types", icon: "apps-outline" },
  { value: "cash", label: "Cash", icon: "cash-outline" },
  { value: "bank", label: "Bank account", icon: "business-outline" },
  { value: "savings", label: "Savings account", icon: "wallet-outline" },
  { value: "credit_card", label: "Credit card", icon: "card-outline" },
  { value: "wallet", label: "Wallet", icon: "wallet-outline" },
  { value: "investment", label: "Investment", icon: "trending-up-outline" },
  { value: "other", label: "Other", icon: "briefcase-outline" },
];

const accountTypeConfig: Record<
  AccountType,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  cash: { label: "Cash", icon: "cash-outline" },
  bank: { label: "Bank account", icon: "business-outline" },
  savings: { label: "Savings", icon: "wallet-outline" },
  credit_card: { label: "Credit card", icon: "card-outline" },
  wallet: { label: "Wallet", icon: "wallet-outline" },
  investment: { label: "Investment", icon: "trending-up-outline" },
  other: { label: "Other", icon: "briefcase-outline" },
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

function fromApiAccount(account: ApiAccount): Account {
  return {
    id: account._id,
    name: account.name,
    type: account.type,
    institution: account.institution || "Personal",
    balance: account.currentBalance,
    currency: account.currency,
    accountNumber: account.accountNumber || "Not provided",
    active: account.isActive,
    isDefault: account.isDefault,
  };
}





function AppButton({
  title,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.primaryButton,
        variant === "secondary" && styles.secondaryButton,
        variant === "danger" && styles.dangerButton,
        variant === "ghost" && styles.ghostButton,
        (disabled || loading) && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "danger" ? "#ffffff" : "#111827"}
        />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={17}
              color={
                variant === "primary" || variant === "danger"
                  ? "#ffffff"
                  : "#374151"
              }
            />
          ) : null}

          <Text
            style={[
              styles.buttonText,
              variant === "primary" && styles.primaryButtonText,
              variant === "danger" && styles.primaryButtonText,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

function SummaryCard({
  title,
  amount,
  description,
  icon,
  hidden,
}: {
  title: string;
  amount: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  hidden?: boolean;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>{title}</Text>

        <View style={styles.summaryIcon}>
          <Ionicons name={icon} size={18} color="#6b7280" />
        </View>
      </View>

      <Text
        style={styles.summaryAmount}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {hidden ? "••••••" : amount}
      </Text>

      <Text style={styles.summaryDescription}>{description}</Text>
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  maxLength,
  editable = true,
  helperText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  maxLength?: number;
  editable?: boolean;
  helperText?: string;
}) {
  return (
    <View style={styles.formField}>
      <FieldLabel>{label}</FieldLabel>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        style={[styles.textInput, !editable && styles.inputDisabled]}
      />

      {helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}





export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<AccountType | "all">("all");
  const [showBalances, setShowBalances] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [filterPickerOpen, setFilterPickerOpen] = useState(false);
  const [actionsAccount, setActionsAccount] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formError, setFormError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const loadAccounts = useCallback(async () => {
    try {
      setLoadError("");

      const response = await getAccounts();
      setAccounts(response.map(fromApiAccount));
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load accounts.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch = [
        account.name,
        account.institution,
        account.accountNumber,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesType =
        filterType === "all" || account.type === filterType;

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

  function displayBalance(amount: number) {
    return showBalances ? formatCurrency(amount) : "••••••";
  }

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
    setInstitution(account.institution === "Personal" ? "" : account.institution);
    setBalance("");
    setAccountNumber(
      account.accountNumber === "Not provided" ? "" : account.accountNumber,
    );
    setFormError("");
    setActionsAccount(null);
    setDialogOpen(true);
  }

  async function handleSaveAccount() {
    setFormError("");

    const trimmedName = name.trim();
    const trimmedInstitution = institution.trim();
    const numericBalance = Number(balance);

    if (!trimmedName) {
      setFormError("Please enter an account name.");
      return;
    }

    if (!editingAccount && (!balance.trim() || !Number.isFinite(numericBalance))) {
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
      setFormError(
        error instanceof Error ? error.message : "Unable to save account.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deleteTarget) return;

    try {
      setLoadError("");
      await deleteAccountRequest(deleteTarget.id);
      setDeleteTarget(null);
      await loadAccounts();
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to delete account.",
      );
      setDeleteTarget(null);
    }
  }

  async function toggleAccountStatus(account: Account) {
    setActionsAccount(null);

    try {
      setLoadError("");
      await updateAccount(account.id, { isActive: !account.active });
      await loadAccounts();
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to update account.",
      );
    }
  }

  function requestDelete(account: Account) {
    setActionsAccount(null);

    if (account.isDefault) {
      Alert.alert(
        "Default account",
        "The default account cannot be deleted. You can deactivate it if your application allows that.",
      );
      return;
    }

    setDeleteTarget(account);
  }

  const selectedFilter = accountTypeOptions.find(
    (option) => option.value === filterType,
  );

  const selectedAccountType = accountTypeOptions.find(
    (option) => option.value === type,
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageContent}>
          {/* Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeading}>
              <Text style={styles.pageTitle}>Accounts</Text>
              <Text style={styles.pageDescription}>
                Manage your accounts, balances and institutions.
              </Text>
            </View>

            <View style={styles.headerActions}>
              <AppButton
                title={showBalances ? "Hide balances" : "Show balances"}
                icon={showBalances ? "eye-off-outline" : "eye-outline"}
                variant="secondary"
                onPress={() => setShowBalances((previous) => !previous)}
              />

              <AppButton
                title="Add account"
                icon="add"
                onPress={openCreateDialog}
              />
            </View>
          </View>

          {/* Error */}
          {loadError ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color="#b91c1c"
              />

              <Text style={styles.errorText}>{loadError}</Text>

              <Pressable onPress={() => setLoadError("")}>
                <Ionicons name="close" size={18} color="#b91c1c" />
              </Pressable>
            </View>
          ) : null}

          {/* Summary cards */}
          <View style={styles.summaryGrid}>
            <SummaryCard
              title="Total assets"
              amount={formatCurrency(totalAssets)}
              description="Active non-credit balances"
              icon="wallet-outline"
              hidden={!showBalances}
            />

            <SummaryCard
              title="Total liabilities"
              amount={formatCurrency(totalLiabilities)}
              description="Outstanding credit balances"
              icon="card-outline"
              hidden={!showBalances}
            />

            <SummaryCard
              title="Net worth"
              amount={formatCurrency(netWorth)}
              description="Assets minus liabilities"
              icon="cash-outline"
              hidden={!showBalances}
            />

            <SummaryCard
              title="Active accounts"
              amount={`${activeAccounts}`}
              description={`Out of ${accounts.length} accounts`}
              icon="checkmark-circle-outline"
            />
          </View>

          {/* Account list panel */}
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Your accounts</Text>
              <Text style={styles.panelDescription}>
                View and manage your account details and balances.
              </Text>

              {/* Search */}
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search-outline"
                  size={19}
                  color="#6b7280"
                />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search accounts..."
                  placeholderTextColor="#9ca3af"
                  accessibilityLabel="Search accounts"
                  style={styles.searchInput}
                  returnKeyType="search"
                />

                {search.length > 0 ? (
                  <Pressable onPress={() => setSearch("")}>
                    <Ionicons
                      name="close-circle"
                      size={19}
                      color="#9ca3af"
                    />
                  </Pressable>
                ) : null}
              </View>

              {/* Account type filter */}
              <Pressable
                style={styles.selectButton}
                onPress={() => setFilterPickerOpen(true)}
              >
                <Ionicons
                  name={selectedFilter?.icon ?? "apps-outline"}
                  size={18}
                  color="#4b5563"
                />

                <Text style={styles.selectButtonText} numberOfLines={1}>
                  {selectedFilter?.label ?? "All account types"}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={18}
                  color="#6b7280"
                />
              </Pressable>
            </View>

            <View style={styles.panelBody}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#111827" />
                  <Text style={styles.mutedText}>Loading accounts...</Text>
                </View>
              ) : filteredAccounts.length > 0 ? (
                <View style={styles.accountGrid}>
                  {filteredAccounts.map((account) => {
                    const config = accountTypeConfig[account.type];

                    return (
                      <View
                        key={account.id}
                        style={[
                          styles.accountCard,
                          !account.active && styles.inactiveAccountCard,
                        ]}
                      >
                        <View style={styles.accountCardHeader}>
                          <View style={styles.accountHeading}>
                            <View style={styles.accountIcon}>
                              <Ionicons
                                name={config.icon}
                                size={22}
                                color="#4b5563"
                              />
                            </View>

                            <View style={styles.accountNameContainer}>
                              <Text
                                style={styles.accountName}
                                numberOfLines={1}
                              >
                                {account.name}
                              </Text>

                              <Text
                                style={styles.accountInstitution}
                                numberOfLines={1}
                              >
                                {account.institution}
                              </Text>
                            </View>
                          </View>

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Actions for ${account.name}`}
                            onPress={() => setActionsAccount(account)}
                            style={styles.moreButton}
                          >
                            <Ionicons
                              name="ellipsis-horizontal"
                              size={21}
                              color="#4b5563"
                            />
                          </Pressable>
                        </View>

                        <View style={styles.accountDivider} />

                        <Text style={styles.balanceLabel}>
                          {account.type === "credit_card"
                            ? "Outstanding balance"
                            : "Current balance"}
                        </Text>

                        <Text
                          style={styles.accountBalance}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                        >
                          {displayBalance(Math.abs(account.balance))}
                        </Text>

                        <View style={styles.accountFooter}>
                          <View style={styles.accountTypeBadge}>
                            <Text style={styles.accountTypeBadgeText}>
                              {config.label}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              account.active
                                ? styles.activeBadge
                                : styles.inactiveBadge,
                            ]}
                          >
                            <View
                              style={[
                                styles.statusDot,
                                account.active
                                  ? styles.activeDot
                                  : styles.inactiveDot,
                              ]}
                            />

                            <Text
                              style={[
                                styles.statusText,
                                account.active
                                  ? styles.activeText
                                  : styles.inactiveText,
                              ]}
                            >
                              {account.active ? "Active" : "Inactive"}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={styles.accountNumber}
                          numberOfLines={1}
                        >
                          Reference: {account.accountNumber}
                        </Text>

                        {account.isDefault ? (
                          <View style={styles.defaultBadge}>
                            <Ionicons
                              name="star"
                              size={12}
                              color="#92400e"
                            />
                            <Text style={styles.defaultBadgeText}>
                              Default account
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="wallet-outline"
                      size={27}
                      color="#6b7280"
                    />
                  </View>

                  <Text style={styles.emptyTitle}>No accounts found</Text>

                  <Text style={styles.emptyDescription}>
                    Try a different search or account type.
                  </Text>

                  <AppButton
                    title="Clear filters"
                    variant="secondary"
                    onPress={() => {
                      setSearch("");
                      setFilterType("all");
                    }}
                  />
                </View>
              )}

              <View style={styles.panelFooter}>
                <Text style={styles.footerText}>
                  Showing {filteredAccounts.length} of {accounts.length} accounts
                </Text>

                <Text style={styles.footerText}>
                  Balances are displayed in INR.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Create / Edit account modal */}
      <Modal
        visible={dialogOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.formModal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeading}>
                <Text style={styles.modalTitle}>
                  {editingAccount ? "Edit account" : "Add account"}
                </Text>

                <Text style={styles.modalDescription}>
                  {editingAccount
                    ? "Update the details for this account."
                    : "Add an account to track its balance and transactions."}
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={22} color="#4b5563" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.formScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FormInput
                label="Account name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Primary Bank Account"
                maxLength={80}
              />

              <View style={styles.formField}>
                <FieldLabel>Account type</FieldLabel>

                <Pressable
                  style={styles.selectButton}
                  onPress={() => setTypePickerOpen(true)}
                >
                  <Ionicons
                    name={selectedAccountType?.icon ?? "wallet-outline"}
                    size={18}
                    color="#4b5563"
                  />

                  <Text style={styles.selectButtonText}>
                    {accountTypeConfig[type].label}
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color="#6b7280"
                  />
                </Pressable>
              </View>

              <FormInput
                label="Bank or institution"
                value={institution}
                onChangeText={setInstitution}
                placeholder="e.g. HDFC Bank"
                maxLength={80}
              />

              <FormInput
                label="Opening balance"
                value={balance}
                onChangeText={setBalance}
                placeholder="0.00"
                keyboardType="decimal-pad"
                editable={!editingAccount}
                helperText={
                  editingAccount
                    ? "Balances change through completed transactions and cannot be edited here."
                    : "Opening balance initializes the account balance."
                }
              />

              <FormInput
                label="Account reference (optional)"
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="e.g. •••• 4582"
                maxLength={40}
                helperText="Use a masked reference only. Never enter a PIN, CVV, or banking password."
              />

              {formError ? (
                <View style={styles.formErrorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#b91c1c"
                  />
                  <Text style={styles.formErrorText}>{formError}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.modalActions}>
              <View style={styles.modalActionItem}>
                <AppButton
                  title="Cancel"
                  variant="secondary"
                  onPress={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isSaving}
                />
              </View>

              <View style={styles.modalActionItem}>
                <AppButton
                  title={
                    editingAccount ? "Save changes" : "Create account"
                  }
                  onPress={() => void handleSaveAccount()}
                  loading={isSaving}
                  disabled={isSaving}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Account type picker */}
      <Modal
        visible={typePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTypePickerOpen(false)}
      >
        <Pressable
          style={styles.pickerOverlay}
          onPress={() => setTypePickerOpen(false)}
        >
          <Pressable style={styles.pickerModal} onPress={() => {}}>
            <Text style={styles.pickerTitle}>Select account type</Text>

            <ScrollView>
              {accountTypeOptions
                .filter((option) => option.value !== "all")
                .map((option) => (
                  <Pressable
                    key={option.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      setType(option.value as AccountType);
                      setFormError("");
                      setTypePickerOpen(false);
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color="#4b5563"
                    />

                    <Text style={styles.pickerOptionText}>
                      {option.label}
                    </Text>

                    {type === option.value ? (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color="#111827"
                      />
                    ) : null}
                  </Pressable>
                ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Filter picker */}
      <Modal
        visible={filterPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterPickerOpen(false)}
      >
        <Pressable
          style={styles.pickerOverlay}
          onPress={() => setFilterPickerOpen(false)}
        >
          <Pressable style={styles.pickerModal} onPress={() => {}}>
            <Text style={styles.pickerTitle}>Filter accounts</Text>

            {accountTypeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={styles.pickerOption}
                onPress={() => {
                  setFilterType(option.value);
                  setFilterPickerOpen(false);
                }}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color="#4b5563"
                />

                <Text style={styles.pickerOptionText}>
                  {option.label}
                </Text>

                {filterType === option.value ? (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#111827"
                  />
                ) : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Account actions */}
      <Modal
        visible={Boolean(actionsAccount)}
        transparent
        animationType="fade"
        onRequestClose={() => setActionsAccount(null)}
      >
        <Pressable
          style={styles.pickerOverlay}
          onPress={() => setActionsAccount(null)}
        >
          <Pressable style={styles.actionSheet} onPress={() => {}}>
            <Text style={styles.pickerTitle} numberOfLines={1}>
              {actionsAccount?.name ?? "Account actions"}
            </Text>

            <Pressable
              style={styles.actionOption}
              onPress={() => {
                if (actionsAccount) openEditDialog(actionsAccount);
              }}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color="#374151"
              />
              <Text style={styles.actionOptionText}>Edit account</Text>
            </Pressable>

            <Pressable
              style={styles.actionOption}
              onPress={() => {
                if (actionsAccount) {
                  void toggleAccountStatus(actionsAccount);
                }
              }}
            >
              <Ionicons
                name={
                  actionsAccount?.active
                    ? "pause-circle-outline"
                    : "play-circle-outline"
                }
                size={20}
                color="#374151"
              />
              <Text style={styles.actionOptionText}>
                {actionsAccount?.active
                  ? "Deactivate account"
                  : "Activate account"}
              </Text>
            </Pressable>

            <View style={styles.actionDivider} />

            <Pressable
              style={styles.actionOption}
              onPress={() => {
                if (actionsAccount) requestDelete(actionsAccount);
              }}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color="#b91c1c"
              />
              <Text style={styles.deleteActionText}>Delete account</Text>
            </Pressable>

            <AppButton
              title="Cancel"
              variant="secondary"
              onPress={() => setActionsAccount(null)}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        visible={Boolean(deleteTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIcon}>
              <Ionicons
                name="trash-outline"
                size={24}
                color="#b91c1c"
              />
            </View>

            <Text style={styles.modalTitle}>Delete account?</Text>

            <Text style={styles.confirmDescription}>
              You are about to delete{" "}
              <Text style={styles.confirmAccountName}>
                {deleteTarget?.name}
              </Text>
              . This action cannot be undone. Accounts with transactions or
              default-account status may not be deletable by the server.
            </Text>

            <View style={styles.modalActions}>
              <View style={styles.modalActionItem}>
                <AppButton
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setDeleteTarget(null)}
                />
              </View>

              <View style={styles.modalActionItem}>
                <AppButton
                  title="Delete account"
                  icon="trash-outline"
                  variant="danger"
                  onPress={() => void handleDeleteAccount()}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}





const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 36,
  },

  pageContent: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    gap: 24,
  },

  pageHeader: {
    gap: 16,
  },

  pageHeading: {
    gap: 6,
  },

  pageTitle: {
    fontSize: 27,
    fontWeight: "700",
    color: "#111827",
  },

  pageDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
  },

  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  button: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },

  primaryButton: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#111827",
  },

  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  dangerButton: {
    backgroundColor: "#b91c1c",
    borderWidth: 1,
    borderColor: "#b91c1c",
  },

  ghostButton: {
    backgroundColor: "transparent",
  },

  disabledButton: {
    opacity: 0.55,
  },

  pressedButton: {
    opacity: 0.8,
  },

  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  primaryButtonText: {
    color: "#ffffff",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    padding: 12,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#b91c1c",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  summaryCard: {
    width: "48.5%",
    minWidth: 0,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    padding: 13,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 14,
  },

  summaryTitle: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
    color: "#6b7280",
  },

  summaryIcon: {
    width: 30,
    height: 30,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },

  summaryAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  summaryDescription: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 16,
    color: "#6b7280",
  },

  panel: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  panelHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 14,
  },

  panelTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  panelDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7280",
  },

  searchContainer: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 10,
  },

  selectButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
  },

  selectButtonText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
  },

  panelBody: {
    padding: 16,
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 48,
  },

  mutedText: {
    fontSize: 13,
    color: "#6b7280",
  },

  accountGrid: {
    gap: 12,
  },

  accountCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    padding: 15,
  },

  inactiveAccountCard: {
    opacity: 0.65,
  },

  accountCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  accountHeading: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  accountIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 11,
    backgroundColor: "#f9fafb",
  },

  accountNameContainer: {
    flex: 1,
    minWidth: 0,
  },

  accountName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  accountInstitution: {
    marginTop: 5,
    fontSize: 12,
    color: "#6b7280",
  },

  moreButton: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },

  accountDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginTop: 18,
    marginBottom: 14,
  },

  balanceLabel: {
    fontSize: 12,
    color: "#6b7280",
  },

  accountBalance: {
    marginTop: 5,
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  accountFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 14,
  },

  accountTypeBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  accountTypeBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#4b5563",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  activeBadge: {
    backgroundColor: "#ecfdf5",
  },

  inactiveBadge: {
    backgroundColor: "#f3f4f6",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },

  activeDot: {
    backgroundColor: "#059669",
  },

  inactiveDot: {
    backgroundColor: "#9ca3af",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },

  activeText: {
    color: "#047857",
  },

  inactiveText: {
    color: "#6b7280",
  },

  accountNumber: {
    marginTop: 13,
    fontSize: 11,
    color: "#6b7280",
  },

  defaultBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    borderRadius: 6,
    backgroundColor: "#fffbeb",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#92400e",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 36,
  },

  emptyIcon: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  emptyDescription: {
    marginBottom: 5,
    fontSize: 13,
    textAlign: "center",
    color: "#6b7280",
  },

  panelFooter: {
    gap: 7,
    marginTop: 22,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  footerText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#6b7280",
  },

  
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    padding: 16,
  },

  formModal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "90%",
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  modalHeading: {
    flex: 1,
    gap: 6,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },

  modalDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7280",
  },

  modalCloseButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },

  formScroll: {
    paddingHorizontal: 20,
  },

  formField: {
    gap: 8,
    marginTop: 18,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  textInput: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },

  inputDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
  },

  helperText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#6b7280",
  },

  formErrorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 18,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    padding: 12,
  },

  formErrorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#b91c1c",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  modalActionItem: {
    flex: 1,
    minWidth: 0,
  },

  
  pickerOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    padding: 20,
  },

  pickerModal: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "75%",
    alignSelf: "center",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    padding: 16,
  },

  pickerTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  pickerOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 11,
  },

  pickerOptionText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },

  
  actionSheet: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 4,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    padding: 18,
  },

  actionOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },

  actionOptionText: {
    fontSize: 14,
    color: "#374151",
  },

  deleteActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#b91c1c",
  },

  actionDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 5,
  },

  
  confirmModal: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 22,
  },

  confirmIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#fef2f2",
    marginBottom: 16,
  },

  confirmDescription: {
    marginTop: 10,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 20,
    color: "#6b7280",
  },

  confirmAccountName: {
    fontWeight: "700",
    color: "#111827",
  },
});