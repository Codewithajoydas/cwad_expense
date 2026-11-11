
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CreateExpenseForm from "../../../components/create-expense-form";
import CreateIncomeForm from "../../../components/create-income-form";
import CreateTransferForm from "../../../components/create-transfer-form";


type TabType = "expense" | "income" | "transfer";

const COLORS = {
  background: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
};

export default function CreateExpense() {
  const [activeTab, setActiveTab] = useState<TabType>("expense");

  const tabs: { label: string; value: TabType }[] = [
    { label: "Expense", value: "expense" },
    { label: "Income", value: "income" },
    { label: "Transfer", value: "transfer" },
  ];

  return (
    <View style={styles.screen}>
      {/* Tabs navigation */}

      <View style={styles.tabContainer}>
        <View style={styles.tabList}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <Pressable
                key={tab.value}
                onPress={() => setActiveTab(tab.value)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.tab,
                  isActive && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Active form */}

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "expense" && <CreateExpenseForm />}

        {activeTab === "income" && <CreateIncomeForm />}

        {activeTab === "transfer" && (
          <CreateTransferForm />
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

  tabContainer: {
    width: "100%",
    maxWidth: 576,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  tabList: {
    flexDirection: "row",
    width: "100%",
    padding: 4,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },

  tab: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderRadius: 7,
  },

  activeTab: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.muted,
  },

  activeTabText: {
    color: COLORS.text,
    fontWeight: "600",
  },

  formScroll: {
    flex: 1,
  },

  formContainer: {
    width: "100%",
    maxWidth: 576,
    alignSelf: "center",
    paddingTop: 16,
    paddingBottom: 32,
  },
});
