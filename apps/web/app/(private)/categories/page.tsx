import Categories from "@/screens/private/Categories";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata({
  title: "Categories",
  description: "Organize your financial activity with transaction categories.",
  path: "/categories",
  noIndex: true,
});

export default function CategoriesPage() {
  return <Categories />;
}
