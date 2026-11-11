
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ArrowDownUp,
  Banknote,
  BriefcaseBusiness,
  Bus,
  CalendarDays,
  Clapperboard,
  Coffee,
  GraduationCap,
  HeartPulse,
  House,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Utensils,
  Wallet,
  Zap,
  Check,
  ChevronDown,
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

const categoryIcons: Record<string, any> = {
  food: Utensils,
  groceries: ShoppingCart,
  transport: Bus,
  shopping: ShoppingBag,
  utilities: Zap,
  housing: House,
  health: HeartPulse,
  education: GraduationCap,
  entertainment: Clapperboard,
  coffee: Coffee,
  mobile: Smartphone,
  business: BriefcaseBusiness,
  cash: Banknote,
  other: MoreHorizontal,
};

type SelectionItem = {
  _id: string;
  name: string;
  icon?: string;
};

type SelectionModalProps = {
  visible: boolean;
  title: string;
  items: SelectionItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

function SelectionModal({
  visible,
  title,
  items,
  selectedId,
  onSelect,
  onClose,
}: SelectionModalProps) {
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
              accessibilityLabel="Close selection"
            >
              <X size={22} color={COLORS.text} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => {
              const selected = item._id === selectedId;

              return (
                <Pressable
                  key={item._id}
                  onPress={() => onSelect(item._id)}
                  style={[
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>

                  {selected && (
                    <Check size={20} color={COLORS.primary} />
                  )}
                </Pressable>
              );
            })}

            {items.length === 0 && (
              <Text style={styles.emptyText}>
                No options available.
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function CreateExpenseForm() {
  const {
    accounts,
    categories,
    isLoading: isLoadingOptions,
    error: optionsError,
  } = useFinanceOptions("expense");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showAccountModal, setShowAccountModal] = useState(false);

  const selectedAccount = accounts.find(
    (item: SelectionItem) => item._id === account
  );

  const formattedDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  async function handleSubmit() {
    setError("");
    setSuccess("");

    const trimmedTitle = title.trim();
    const trimmedNotes = notes.trim();
    const numericAmount = Number(amount);

    if (!trimmedTitle) {
      setError("Please enter an expense title.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (!category || !account || !formattedDate) {
      setError("Please select a category, account, and date.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createTransaction({
        type: "expense",
        amount: numericAmount,
        description: trimmedTitle,
        category,
        account,
        date: formattedDate,
        notes: trimmedNotes,
        paymentMethod: "other",
        status: "completed",
      });

      setSuccess("Expense saved successfully.");

      setAmount("");
      setTitle("");
      setNotes("");
      setCategory("");
      setAccount("");
      setDate(new Date());

      Alert.alert("Success", "Expense saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the expense."
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
      {/* Expense amount */}

      <View style={styles.amountCard}>
        <View style={styles.sectionHeading}>
          <Wallet size={18} color={COLORS.muted} />

          <Text style={styles.amountLabel}>
            Expense amount
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
            accessibilityLabel="Expense amount"
            maxLength={15}
          />
        </View>

        <Text style={styles.helperText}>
          Enter the total amount you spent.
        </Text>
      </View>

      {/* Expense title */}

      <View style={styles.section}>
        <Text style={styles.label}>Expense title</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Lunch with colleagues"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          maxLength={120}
        />
      </View>

      {/* Categories */}

      <View style={styles.section}>
        <View style={styles.categoryHeading}>
          <Text style={styles.label}>Category</Text>

          <Text style={styles.helperText}>
            {isLoadingOptions
              ? "Loading categories..."
              : `${categories.length} categories`}
          </Text>
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((item: SelectionItem) => {
            const Icon =
              categoryIcons[item.icon ?? "other"] ??
              MoreHorizontal;

            const selected = category === item._id;

            return (
              <Pressable
                key={item._id}
                onPress={() => setCategory(item._id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                style={[
                  styles.categoryItem,
                  selected && styles.categoryItemSelected,
                ]}
              >
                <Icon
                  size={22}
                  color={
                    selected ? COLORS.primary : COLORS.muted
                  }
                  strokeWidth={1.8}
                />

                <Text
                  numberOfLines={2}
                  style={[
                    styles.categoryName,
                    selected && styles.categoryNameSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Account selection */}

      <View style={styles.section}>
        <Text style={styles.label}>Paid from</Text>

        <Pressable
          onPress={() => setShowAccountModal(true)}
          style={styles.selectButton}
          accessibilityRole="button"
          accessibilityLabel="Select account"
        >
          <View style={styles.selectButtonLeft}>
            <Wallet size={19} color={COLORS.muted} />

            <Text
              style={[
                styles.selectText,
                !selectedAccount && styles.placeholderText,
              ]}
            >
              {selectedAccount?.name ?? "Select account"}
            </Text>
          </View>

          <ChevronDown size={19} color={COLORS.muted} />
        </Pressable>
      </View>

      {/* Expense date */}

      <View style={styles.section}>
        <Text style={styles.label}>Expense date</Text>

        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={styles.selectButton}
          accessibilityRole="button"
          accessibilityLabel="Choose expense date"
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

          <ArrowDownUp size={17} color={COLORS.muted} />
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            maximumDate={new Date()}
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
          placeholder="Add a note about this expense..."
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
          maxLength={1000}
          style={styles.textArea}
        />
      </View>

      {/* Error and success messages */}

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
          Check your details before saving.
        </Text>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || isLoadingOptions}
          style={[
            styles.submitButton,
            (isSubmitting || isLoadingOptions) &&
              styles.submitButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Plus size={19} color="#FFFFFF" />

              <Text style={styles.submitButtonText}>
                Save expense
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Account selection modal */}

      <SelectionModal
        visible={showAccountModal}
        title="Select account"
        items={accounts}
        selectedId={account}
        onSelect={(id) => {
          setAccount(id);
          setShowAccountModal(false);
        }}
        onClose={() => setShowAccountModal(false)}
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
    marginBottom: 14,
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

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingHorizontal: 13,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },

  categoryHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  categoryItem: {
    width: "31%",
    minHeight: 94,
    flexGrow: 1,
    flexBasis: "28%",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },

  categoryItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
  },

  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.muted,
    textAlign: "center",
  },

  categoryNameSelected: {
    color: COLORS.primary,
  },

  selectButton: {
    minHeight: 48,
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
    fontSize: 14,
    color: COLORS.text,
  },

  placeholderText: {
    color: "#94A3B8",
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
    color: COLORS.danger,
    lineHeight: 19,
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
    minHeight: 52,
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

  optionText: {
    fontSize: 14,
    color: COLORS.text,
  },

  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
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
