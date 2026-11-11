
import { Drawer } from "expo-router/drawer";
import "../global.css";
import CustomDrawer from "../../components/layout/CustomDrawer";

export default function RootLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: 300 },
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ title: "Cwad Expense" }} />
    </Drawer>
  );
}
