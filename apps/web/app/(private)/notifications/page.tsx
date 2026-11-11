
import Notifications from "@/screens/private/Notifications";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Notifications",
  description: "View updates and notifications for your CWAD Expense account.",
  path: "/notifications",
  noIndex: true,
});

export default function NotificationsPage() {
  return <Notifications />;
}
