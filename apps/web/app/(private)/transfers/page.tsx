import Transfers from "@/screens/private/Transfers";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Transfers",
  description: "Track transfers between your financial accounts.",
  path: "/transfers",
  noIndex: true,
});

export default function TransfersPage() {
  return <Transfers />;
}
