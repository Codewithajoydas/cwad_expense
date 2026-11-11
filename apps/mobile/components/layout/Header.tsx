import React from "react";
import { View, Text, Pressable, StatusBar } from "react-native";
import { Octicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, usePathname } from "expo-router";
import { DrawerActions } from "@react-navigation/native";

const tabTitles: Record<string, string> = {
  "/": "Dashboard",
  "/accounts": "Accounts",
  "/reports": "Reports",
  "/transaction": "Transactions",
  "/add": "Add Transaction",
};

export default function Header() {
  const pathname = usePathname();
  const navigation = useNavigation();
  const title = tabTitles[pathname] ?? "Dashboard";

  return (
    <View className="bg-white">
      <StatusBar barStyle="dark-content"/>

      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="flex-row items-center justify-between bg-white px-2 py-3">
          <View className="flex-row items-center gap-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open navigation menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              className="h-[50px] w-[50px] items-center justify-center rounded-2xl border border-gray-200 bg-white"
            >
              <Octicons name="sidebar-collapse" size={18} color="#111111" />
            </Pressable>

            <Text className="text-xl font-bold text-black">{title}</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <Pressable className="h-[50px] w-[50px] items-center justify-center rounded-full">
              <Feather name="bell" size={20} color="#111111" />
            </Pressable>

            <Pressable className="h-[50px] w-[50px] items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100">
              <Text className="text-xl font-semibold text-gray-900">AD</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}