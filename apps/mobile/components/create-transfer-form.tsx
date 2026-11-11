
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ArrowLeftRight,
  CalendarDays,
  Check,
  ChevronDown,
  Plus,
  Wallet,
  X,
} from "lucide-react-native";

import { createTransaction } from "../lib/api-client";
import { useFinanceOptions } from "../lib/use-finance-options";

const COLORS = {
  background: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  danger: "#DC2626",
  success: "#15803D",
};

type Account = {
  _id: string;
  name: string;
};

type AccountPickerProps = {
  visible: boolean;
  title: string;
  accounts: Account[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

function AccountPicker({
  visible,
  title,
  accounts,
  selectedId,
  onSelect,
  onClose,
}: AccountPickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityLabel="Close account selection"
            >
              <X size={22} color={COLORS.text} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {accounts.map((item) => {
              const selected = item._id === selectedId;

              return (
                <Pressable
                  key={item._id}
                  onPress={() => onSelect(item._id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  style={[
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                  ]}
                >
                  <View style={styles.optionLeft}>
                    <Wallet
                      size={19}
                      color={
                        selected ? COLORS.primary : COLORS.muted
                      }
                    />

                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>

                  {selected && (
                    <Check
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </Pressable>
              );
            })}

            {accounts.length === 0 && (
              <Text style={styles.emptyText}>
                No accounts available.
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

type CreateTransferFormProps = {
  onCreated?: () => void;
};

export default function CreateTransferForm({
  onCreated,
}: CreateTransferFormProps) {
  const {
    accounts,
    isLoading: isLoadingOptions,
    error: optionsError,
  } = useFinanceOptions();

  const [amount, setAmount] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const sourceAccount = accounts.find(
    (item: Account) => item._id === fromAccount
  );

  const destinationAccount = accounts.find(
    (item: Account) => item._id === toAccount
  );

  const formattedDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  function swapAccounts() {
    setFromAccount(toAccount);
    setToAccount(fromAccount);
    setError("");
    setSuccess("");
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!fromAccount || !toAccount) {
      setError("Please select both accounts.");
      return;
    }

    if (fromAccount === toAccount) {
      setError(
        "Source and destination accounts must be different."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await createTransaction({
        type: "transfer",
        amount: numericAmount,
        account: fromAccount,
        toAccount,
        date: formattedDate,
        notes: notes.trim(),
        status: "completed",
      });

      setSuccess("Transfer recorded successfully.");

      // Preserve the callback from the original component.
      onCreated?.();

      setAmount("");
      setFromAccount("");
      setToAccount("");
      setNotes("");
      setDate(new Date());

      Alert.alert(
        "Success",
        "Transfer recorded successfully."
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save transfer."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Transfer amount */}

      <View style={styles.amountCard}>
        <View style={styles.sectionHeading}>
          <ArrowLeftRight
            size={18}
            color={COLORS.muted}
          />

          <Text style={styles.amountLabel}>
            Transfer amount
          </Text>
        </View>

        <View style={styles.amountInputRow}>
          <Text style={styles.currencySymbol}>₹</Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            style={styles.amountInput}
            accessibilityLabel="Transfer amount"
            maxLength={15}
          />
        </View>

        <Text style={styles.helperText}>
          Enter the amount you want to move between accounts.
        </Text>
      </View>

      {/* Account selection */}

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>
            Transfer between accounts
          </Text>
        </View>

        <Text style={styles.helperText}>
          Choose where the money comes from and where it goes.
        </Text>

        {/* Source account */}

        <View style={styles.accountField}>
          <Text style={styles.label}>From account</Text>

          <Pressable
            onPress={() => setShowFromPicker(true)}
            style={styles.selectButton}
            accessibilityRole="button"
            accessibilityLabel="Select source account"
          >
            <View style={styles.selectButtonLeft}>
              <Wallet size={19} color={COLORS.muted} />

              <Text
                numberOfLines={1}
                style={[
                  styles.selectText,
                  !sourceAccount && styles.placeholderText,
                ]}
              >
                {sourceAccount?.name ?? "Select source"}
              </Text>
            </View>

            <ChevronDown
              size={19}
              color={COLORS.muted}
            />
          </Pressable>
        </View>

        {/* Swap accounts */}

        <View style={styles.swapContainer}>
          <View style={styles.swapLine} />

          <Pressable
            onPress={swapAccounts}
            disabled={!fromAccount || !toAccount}
            accessibilityRole="button"
            accessibilityLabel="Swap source and destination accounts"
            style={[
              styles.swapButton,
              (!fromAccount || !toAccount) &&
                styles.swapButtonDisabled,
            ]}
          >
            <ArrowLeftRight
              size={20}
              color={
                fromAccount && toAccount
                  ? COLORS.primary
                  : COLORS.muted
              }
            />
          </Pressable>

          <View style={styles.swapLine} />
        </View>

        {/* Destination account */}

        <View style={styles.accountField}>
          <Text style={styles.label}>To account</Text>

          <Pressable
            onPress={() => setShowToPicker(true)}
            style={styles.selectButton}
            accessibilityRole="button"
            accessibilityLabel="Select destination account"
          >
            <View style={styles.selectButtonLeft}>
              <Wallet size={19} color={COLORS.muted} />

              <Text
                numberOfLines={1}
                style={[
                  styles.selectText,
                  !destinationAccount && styles.placeholderText,
                ]}
              >
                {destinationAccount?.name ??
                  "Select destination"}
              </Text>
            </View>

            <ChevronDown
              size={19}
              color={COLORS.muted}
            />
          </Pressable>
        </View>

        {/* Transfer summary */}

        {fromAccount &&
          toAccount &&
          fromAccount !== toAccount && (
            <View style={styles.summaryBox}>
              <Check
                size={18}
                color={COLORS.primary}
              />

              <Text style={styles.summaryText}>
                Money will move from{" "}
                <Text style={styles.summaryStrong}>
                  {sourceAccount?.name}
                </Text>{" "}
                to{" "}
                <Text style={styles.summaryStrong}>
                  {destinationAccount?.name}
                </Text>
                .
              </Text>
            </View>
          )}
      </View>

      {/* Transfer date */}

      <View style={styles.section}>
        <Text style={styles.label}>Transfer date</Text>

        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={styles.selectButton}
          accessibilityRole="button"
          accessibilityLabel="Choose transfer date"
        >
          <View style={styles.selectButtonLeft}>
            <CalendarDays
              size={19}
              color={COLORS.muted}
            />

            <Text style={styles.selectText}>
              {date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          <ChevronDown
            size={19}
            color={COLORS.muted}
          />
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={
              Platform.OS === "ios" ? "spinner" : "default"
            }
            onChange={(event, selectedDate) => {
              if (Platform.OS !== "ios") {
                setShowDatePicker(false);
              }

              if (
                event.type !== "dismissed" &&
                selectedDate
              ) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        {showDatePicker && Platform.OS === "ios" && (
          <Pressable
            onPress={() => setShowDatePicker(false)}
            style={styles.dateDoneButton}
          >
            <Text style={styles.dateDoneText}>Done</Text>
          </Pressable>
        )}
      </View>

      {/* Optional notes */}

      <View style={styles.section}>
        <Text style={styles.label}>
          Notes <Text style={styles.optional}>(Optional)</Text>
        </Text>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Moving savings to bank account..."
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
          maxLength={1000}
          style={styles.textArea}
        />
      </View>

      {/* Validation messages */}

      {(optionsError || error) && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {optionsError || error}
          </Text>
        </View>
      )}

      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      {/* Submit */}

      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          Review both accounts before confirming.
        </Text>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || isLoadingOptions}
          style={[
            styles.submitButton,
            (isSubmitting || isLoadingOptions) &&
              styles.submitButtonDisabled,
          ]}
          accessibilityRole="button"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <ArrowLeftRight
                size={19}
                color="#FFFFFF"
              />

              <Text style={styles.submitButtonText}>
                Transfer money
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Source account picker */}

      <AccountPicker
        visible={showFromPicker}
        title="From account"
        accounts={accounts.filter(
          (item: Account) => item._id !== toAccount
        )}
        selectedId={fromAccount}
        onSelect={(id) => {
          setFromAccount(id);
          setShowFromPicker(false);
          setError("");
          setSuccess("");
        }}
        onClose={() => setShowFromPicker(false)}
      />

      {/* Destination account picker */}

      <AccountPicker
        visible={showToPicker}
        title="To account"
        accounts={accounts.filter(
          (item: Account) => item._id !== fromAccount
        )}
        selectedId={toAccount}
        onSelect={(id) => {
          setToAccount(id);
          setShowToPicker(false);
          setError("");
          setSuccess("");
        }}
        onClose={() => setShowToPicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: 20,
    paddingBottom: 36,
    gap: 24,
  },

  amountCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 18,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 8,
  },

  amountLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },

  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },

  currencySymbol: {
    fontSize: 32,
    fontWeight: "600",
    color: COLORS.muted,
  },

  amountInput: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontSize: 34,
    fontWeight: "600",
    color: COLORS.text,
  },

  helperText: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 18,
  },

  section: {
    gap: 12,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  accountField: {
    gap: 9,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },

  optional: {
    fontWeight: "400",
    color: COLORS.muted,
  },

  selectButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: COLORS.background,
  },

  selectButtonLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  selectText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },

  placeholderText: {
    color: "#94A3B8",
  },

  swapContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 1,
  },

  swapLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  swapButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.primaryLight,
  },

  swapButtonDisabled: {
    backgroundColor: COLORS.surface,
  },

  summaryBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  summaryText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
  },

  summaryStrong: {
    fontWeight: "600",
    color: COLORS.text,
  },

  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    padding: 13,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },

  errorBox: {
    padding: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.danger,
  },

  successBox: {
    padding: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
  },

  successText: {
    fontSize: 13,
    color: COLORS.success,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 18,
    gap: 14,
  },

  footerHint: {
    fontSize: 12,
    color: COLORS.muted,
  },

  submitButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },

  modalContent: {
    maxHeight: "75%",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },

  optionRow: {
    minHeight: 54,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionRowSelected: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },

  optionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  optionText: {
    fontSize: 14,
    color: COLORS.text,
  },

  optionTextSelected: {
    fontWeight: "600",
    color: COLORS.primary,
  },

  emptyText: {
    paddingVertical: 20,
    fontSize: 14,
    textAlign: "center",
    color: COLORS.muted,
  },

  dateDoneButton: {
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  dateDoneText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
