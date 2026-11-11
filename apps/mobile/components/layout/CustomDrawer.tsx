
import { usePathname, router, type Href } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from "expo-router/drawer";
import { Pressable, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import logo from "../../assets/images/cwad-expense-logo.png";

type IconName = keyof typeof Ionicons.glyphMap;

type NavigationItem = {
  title: string;
  url: Href;
  pathname: string;
  icon: IconName;
};

type NavigationGroup = {
  title: string;
  links: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    title: "OVERVIEW",
    links: [
      {
        title: "Dashboard",
        url: "/",
        pathname: "/",
        icon: "grid-outline",
      },
    ],
  },
  {
    title: "TRANSACTIONS",
    links: [
      {
        title: "All Transactions",
        url: "/transactions",
        pathname: "/transactions",
        icon: "receipt-outline",
      },
      {
        title: "Add Expense",
        url: "/create-expense",
        pathname: "/create-expense",
        icon: "add-circle-outline",
      },
      {
        title: "Add Income",
        url: "/create-income",
        pathname: "/create-income",
        icon: "trending-up-outline",
      },
      {
        title: "Transfers",
        url: "/transfers",
        pathname: "/transfers",
        icon: "swap-horizontal-outline",
      },
      {
        title: "Recurring",
        url: "/recurring",
        pathname: "/recurring",
        icon: "repeat-outline",
      },
    ],
  },
  {
    title: "MANAGEMENT",
    links: [
      {
        title: "Accounts",
        url: "/accounts",
        pathname: "/accounts",
        icon: "wallet-outline",
      },
      {
        title: "Categories",
        url: "/categories",
        pathname: "/categories",
        icon: "pricetags-outline",
      },
      {
        title: "Budgets",
        url: "/budgets",
        pathname: "/budgets",
        icon: "pie-chart-outline",
      },
      {
        title: "Financial Goals",
        url: "/goals",
        pathname: "/goals",
        icon: "flag-outline",
      },
      {
        title: "Debts & Loans",
        url: "/debts",
        pathname: "/debts",
        icon: "cash-outline",
      },
    ],
  },
  {
    title: "INSIGHTS",
    links: [
      {
        title: "Reports",
        url: "/reports",
        pathname: "/reports",
        icon: "bar-chart-outline",
      },
      {
        title: "Calendar",
        url: "/calendar",
        pathname: "/calendar",
        icon: "calendar-outline",
      },
    ],
  },
];

const footerItems: NavigationItem[] = [
  {
    title: "Notifications",
    url: "/notifications",
    pathname: "/notifications",
    icon: "notifications-outline",
  },
  {
    title: "Settings",
    url: "/settings",
    pathname: "/settings",
    icon: "settings-outline",
  },
];

export default function CustomDrawer({
  navigation,
  ...props
}: DrawerContentComponentProps) {
  const pathname = usePathname();

  const isActive = (itemPath: string) => {
    if (itemPath === "/") {
      return pathname === "/";
    }

    return (
      pathname === itemPath ||
      pathname.startsWith(`${itemPath}/`)
    );
  };

  const navigateTo = (url: Href) => {
    navigation.closeDrawer();
    router.navigate(url);
  };

  const renderItem = (item: NavigationItem) => {
    const active = isActive(item.pathname);

    return (
      <Pressable
        key={item.pathname}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => navigateTo(item.url)}
        className={`mb-1 h-10 flex-row items-center gap-3 rounded-lg px-3 ${
          active ? "bg-gray-100" : "bg-transparent"
        }`}
      >
        <Ionicons
          name={item.icon}
          size={19}
          color={active ? "#111827" : "#6b7280"}
        />

        <Text
          className={`flex-1 text-[13px] ${
            active
              ? "font-semibold text-gray-950"
              : "font-medium text-gray-600"
          }`}
        >
          {item.title}
        </Text>

        {active && (
          <Feather name="chevron-right" size={15} color="#9ca3af" />
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      <DrawerContentScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 12,
          paddingBottom: 16,
        }}
      >
        <View className="flex-1 px-4">
          {/* Brand */}
          <View className="mb-7 flex-row items-center gap-3 px-1">
            <Image
              source={logo}
              accessibilityLabel="CWAD Expense logo"
              resizeMode="contain"
              className="h-10 w-10 shrink-0"
            />

            <View className="min-w-0 flex-1">
              <Text className="text-sm font-semibold tracking-tight text-gray-950">
                CWAD Expense
              </Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                Personal finance
              </Text>
            </View>
          </View>

          {/* Navigation groups */}
          {navigationGroups.map((group) => (
            <View key={group.title} className="mb-6">
              <Text className="mb-2 px-3 text-[10px] font-semibold tracking-widest text-gray-400">
                {group.title}
              </Text>

              {group.links.map(renderItem)}
            </View>
          ))}

          {/* Footer */}
          <View className="mt-auto border-t border-gray-200 pt-4">
            {footerItems.map(renderItem)}

            <View className="mt-4 flex-row items-center gap-3 px-2 pt-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Text className="font-semibold text-gray-800">AD</Text>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">
                  Your account
                </Text>
                <Text className="text-xs text-gray-500">
                  Expense workspace
                </Text>
              </View>
            </View>
          </View>
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}
