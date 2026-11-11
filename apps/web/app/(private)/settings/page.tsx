
import SettingsPage from "@/screens/private/Settings";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Settings",
  description: "Manage your CWAD Expense account preferences.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsRoute() {
  return <SettingsPage />;
}
