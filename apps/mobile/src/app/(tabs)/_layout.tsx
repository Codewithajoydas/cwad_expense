import { Tabs } from "expo-router";
import CustomTabBar from "../../../components/layout/CustomTabBar";
import Header from "../../../components/layout/Header";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ header: () => <Header /> }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="accounts" options={{ title: "Accounts" }} />
      <Tabs.Screen name="add" options={{ title: "Add" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
      <Tabs.Screen name="transaction" options={{ title: "Transactions" }} />
    </Tabs>
  );
}
