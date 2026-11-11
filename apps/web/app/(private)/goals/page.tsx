
import Goals from "@/screens/private/Goals";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Financial Goals",
  description: "Set and monitor your personal savings goals.",
  path: "/goals",
  noIndex: true,
});

export default function GoalsPage() {
  return <Goals />;
}
