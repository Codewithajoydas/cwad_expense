import Calendar from "@/screens/private/Calendar";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Financial Calendar",
  description: "View your financial activity and upcoming recurring transactions.",
  path: "/calendar",
  noIndex: true,
});

export default function CalendarPage() {
  return <Calendar />;
}
