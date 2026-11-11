import Income from "@/screens/private/Income";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Add Income",
  description: "Record income and keep your financial activity up to date.",
  path: "/create-income",
  noIndex: true,
});

export default function CreateIncomePage() {
  return <Income />;
}
