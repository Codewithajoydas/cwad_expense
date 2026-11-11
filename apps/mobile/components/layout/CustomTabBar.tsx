import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CustomTabBarProps = {
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
    }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarLabel?: string | ((props: any) => React.ReactNode);
        tabBarAccessibilityLabel?: string;
      };
    }
  >;
  navigateToTab: (routeKey: string) => void;
};

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "grid-outline",
  accounts: "wallet-outline",
  add: "add",
  reports: "bar-chart-outline",
  transaction: "time-outline",
};

const activeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "grid",
  accounts: "wallet",
  add: "add",
  reports: "bar-chart",
  transaction: "time",
};

export default function CustomTabBar({ state, descriptors, navigateToTab }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-around border-t border-gray-200 bg-white px-2 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isAddButton = route.name === "add";
        const options = descriptors[route.key].options;

        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : (options.title ?? route.name);

        const iconName = isFocused
          ? (activeIcons[route.name] ?? "ellipse")
          : (icons[route.name] ?? "ellipse-outline");

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            accessibilityState={{ selected: isFocused }}
            onPress={() => navigateToTab(route.key)}
            className="flex-1 items-center justify-center gap-1"
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: isAddButton ? 48 : 70,
                height: isAddButton ? 48 : 40,
                borderRadius: 100,
                backgroundColor: isAddButton ? "#000" : isFocused ? "#ddd" : "white",
              }}
            >
              <Ionicons
                name={iconName}
                size={isAddButton ? 27 : 23}
                color={isAddButton ? "#ffffff" : isFocused ? "#000000" : "#6b7280"}
              />
            </View>

            {!isAddButton && (
              <Text
                className={`text-xs capitalize ${
                  isFocused ? "font-semibold text-black" : "text-gray-500"
                }`}
              >
                {label === "Home" ? "Dashboard" : label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
