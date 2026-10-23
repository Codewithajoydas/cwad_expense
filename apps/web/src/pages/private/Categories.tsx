
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Bus,
  Clapperboard,
  Coffee,
  Ellipsis,
  GraduationCap,
  HeartPulse,
  House,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Utensils,
  Wallet,
  Zap,
  Laptop,
  Gift,
  TrendingUp,
  HandCoins,
  Landmark,
  Building2,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryType = "expense" | "income";

type Category = {
  id: string;
  name: string;
  type: CategoryType;
  icon: LucideIcon;
  description: string;
  transactions: number;
  amount: number;
};

const initialCategories: Category[] = [
  {
    id: "food",
    name: "Food & Dining",
    type: "expense",
    icon: Utensils,
    description: "Restaurants, meals and food",
    transactions: 24,
    amount: 4500,
  },
  {
    id: "groceries",
    name: "Groceries",
    type: "expense",
    icon: ShoppingCart,
    description: "Daily essentials and groceries",
    transactions: 12,
    amount: 3200,
  },
  {
    id: "transport",
    name: "Transport",
    type: "expense",
    icon: Bus,
    description: "Travel, fuel and commuting",
    transactions: 18,
    amount: 2100,
  },
  {
    id: "shopping",
    name: "Shopping",
    type: "expense",
    icon: ShoppingBag,
    description: "Clothing and personal purchases",
    transactions: 8,
    amount: 3500,
  },
  {
    id: "housing",
    name: "Housing",
    type: "expense",
    icon: House,
    description: "Rent and household expenses",
    transactions: 2,
    amount: 10000,
  },
  {
    id: "utilities",
    name: "Bills & Utilities",
    type: "expense",
    icon: Zap,
    description: "Electricity, internet and bills",
    transactions: 5,
    amount: 2650,
  },
  {
    id: "health",
    name: "Healthcare",
    type: "expense",
    icon: HeartPulse,
    description: "Medical and health expenses",
    transactions: 3,
    amount: 1200,
  },
  {
    id: "education",
    name: "Education",
    type: "expense",
    icon: GraduationCap,
    description: "Courses, books and learning",
    transactions: 4,
    amount: 1800,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    type: "expense",
    icon: Clapperboard,
    description: "Movies and recreation",
    transactions: 6,
    amount: 950,
  },
  {
    id: "coffee",
    name: "Coffee",
    type: "expense",
    icon: Coffee,
    description: "Coffee shops and beverages",
    transactions: 9,
    amount: 700,
  },
  {
    id: "other-expense",
    name: "Other",
    type: "expense",
    icon: MoreHorizontal,
    description: "Miscellaneous spending",
    transactions: 5,
    amount: 1400,
  },
  {
    id: "salary",
    name: "Salary",
    type: "income",
    icon: BriefcaseBusiness,
    description: "Monthly employment income",
    transactions: 1,
    amount: 45000,
  },
  {
    id: "freelance",
    name: "Freelancing",
    type: "income",
    icon: Laptop,
    description: "Freelance and contract work",
    transactions: 3,
    amount: 12000,
  },
  {
    id: "business",
    name: "Business",
    type: "income",
    icon: Building2,
    description: "Business earnings",
    transactions: 0,
    amount: 0,
  },
  {
    id: "investment",
    name: "Investments",
    type: "income",
    icon: TrendingUp,
    description: "Investment returns and dividends",
    transactions: 2,
    amount: 2500,
  },
  {
    id: "rental",
    name: "Rental Income",
    type: "income",
    icon: House,
    description: "Property rental earnings",
    transactions: 0,
    amount: 0,
  },
  {
    id: "interest",
    name: "Interest",
    type: "income",
    icon: Landmark,
    description: "Bank and savings interest",
    transactions: 1,
    amount: 450,
  },
  {
    id: "gift",
    name: "Gifts",
    type: "income",
    icon: Gift,
    description: "Money received as gifts",
    transactions: 1,
    amount: 1000,
  },
  {
    id: "refund",
    name: "Refunds",
    type: "income",
    icon: HandCoins,
    description: "Returned payments and refunds",
    transactions: 1,
    amount: 650,
  },
  {
    id: "other-income",
    name: "Other Income",
    type: "income",
    icon: CircleDollarSign,
    description: "Other money received",
    transactions: 0,
    amount: 0,
  },
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return currency.format(amount);
}

export default function Categories() {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("expense");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("other");
  const [formError, setFormError] = useState("");

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesType = category.type === activeTab;
      const matchesSearch = `${category.name} ${category.description}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [categories, activeTab, search]);

  const expenseCategories = categories.filter(
    (category) => category.type === "expense"
  );

  const incomeCategories = categories.filter(
    (category) => category.type === "income"
  );

  const expenseTotal = expenseCategories.reduce(
    (sum, category) => sum + category.amount,
    0
  );

  const incomeTotal = incomeCategories.reduce(
    (sum, category) => sum + category.amount,
    0
  );

  const expenseIcons: Record<string, LucideIcon> = {
    food: Utensils,
    groceries: ShoppingCart,
    transport: Bus,
    shopping: ShoppingBag,
    housing: House,
    utilities: Zap,
    health: HeartPulse,
    education: GraduationCap,
    entertainment: Clapperboard,
    coffee: Coffee,
    other: MoreHorizontal,
  };

  const incomeIcons: Record<string, LucideIcon> = {
    salary: BriefcaseBusiness,
    freelance: Laptop,
    business: Building2,
    investment: TrendingUp,
    rental: House,
    interest: Landmark,
    gift: Gift,
    refund: HandCoins,
    other: CircleDollarSign,
  };

  function openCreateDialog() {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIconName("other");
    setFormError("");
    setDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description);
    setIconName(category.id);
    setFormError("");
    setDialogOpen(true);
  }

  function handleSaveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Please enter a category name.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.type === activeTab &&
        category.name.toLowerCase() === trimmedName.toLowerCase() &&
        category.id !== editingCategory?.id
    );

    if (duplicate) {
      setFormError("A category with this name already exists.");
      return;
    }

    const iconMap =
      activeTab === "expense" ? expenseIcons : incomeIcons;

    const selectedIcon = iconMap[iconName] ?? MoreHorizontal;

    if (editingCategory) {
      setCategories((previous) =>
        previous.map((category) =>
          category.id === editingCategory.id
            ? {
                ...category,
                name: trimmedName,
                description: description.trim() || "Custom category",
                icon: selectedIcon,
              }
            : category
        )
      );
    } else {
      const newCategory: Category = {
        id: `${activeTab}-${Date.now()}`,
        name: trimmedName,
        type: activeTab as CategoryType,
        icon: selectedIcon,
        description: description.trim() || "Custom category",
        transactions: 0,
        amount: 0,
      };

      setCategories((previous) => [...previous, newCategory]);
    }

    setDialogOpen(false);
  }

  function handleDeleteCategory() {
    if (!deleteTarget) return;

    setCategories((previous) =>
      previous.filter((category) => category.id !== deleteTarget.id)
    );

    setDeleteTarget(null);
  }

  const availableIcons =
    activeTab === "expense"
      ? [
          { value: "food", label: "Food", icon: Utensils },
          { value: "groceries", label: "Groceries", icon: ShoppingCart },
          { value: "transport", label: "Transport", icon: Bus },
          { value: "shopping", label: "Shopping", icon: ShoppingBag },
          { value: "housing", label: "Housing", icon: House },
          { value: "utilities", label: "Utilities", icon: Zap },
          { value: "health", label: "Healthcare", icon: HeartPulse },
          { value: "education", label: "Education", icon: GraduationCap },
          { value: "entertainment", label: "Entertainment", icon: Clapperboard },
          { value: "coffee", label: "Coffee", icon: Coffee },
          { value: "other", label: "Other", icon: MoreHorizontal },
        ]
      : [
          { value: "salary", label: "Salary", icon: BriefcaseBusiness },
          { value: "freelance", label: "Freelance", icon: Laptop },
          { value: "business", label: "Business", icon: Building2 },
          { value: "investment", label: "Investment", icon: TrendingUp },
          { value: "rental", label: "Rental", icon: House },
          { value: "interest", label: "Interest", icon: Landmark },
          { value: "gift", label: "Gift", icon: Gift },
          { value: "refund", label: "Refund", icon: HandCoins },
          { value: "other", label: "Other", icon: CircleDollarSign },
        ];

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-360 space-y-7">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <Button onClick={openCreateDialog}>
            <Plus className="size-4" />
            Add category
          </Button>
        </header>

        {/* Summary */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="gap-3 py-5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total categories
              </CardTitle>
              <Wallet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold">{categories.length}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Across income and expenses
              </p>
            </CardContent>
          </Card>

          <Card className="gap-3 py-5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expense categories
              </CardTitle>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold">
                {expenseCategories.length}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatCurrency(expenseTotal)} in sample spending
              </p>
            </CardContent>
          </Card>

          <Card className="gap-3 py-5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Income categories
              </CardTitle>
              <ArrowDownLeft className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold">
                {incomeCategories.length}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatCurrency(incomeTotal)} in sample income
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Categories List */}
        <Card className="gap-0 overflow-hidden py-0 shadow-none">
          <CardHeader className="gap-4 border-b px-5 py-5 sm:px-6">
            <div>
              <CardTitle className="text-base font-semibold">
                Manage categories
              </CardTitle>
              <CardDescription className="mt-1">
                Create, edit, and organize your transaction categories.
              </CardDescription>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);
                setSearch("");
              }}
            >
              <TabsList className="grid h-10 w-full max-w-sm grid-cols-2">
                <TabsTrigger value="expense" className="gap-2">
                  <ArrowUpRight className="size-4" />
                  Expenses
                  <Badge variant="secondary">
                    {expenseCategories.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger value="income" className="gap-2">
                  <ArrowDownLeft className="size-4" />
                  Income
                  <Badge variant="secondary">
                    {incomeCategories.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expense" className="hidden" />
              <TabsContent value="income" className="hidden" />
            </Tabs>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                className="h-10 pl-9"
                aria-label="Search categories"
              />
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCategories.map((category) => {
                  const Icon = category.icon;

                  return (
                    <div
                      key={category.id}
                      className="group rounded-xl border bg-background p-4 transition-colors hover:bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
                            <Icon className="size-5 text-muted-foreground" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold">
                              {category.name}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {category.description}
                            </p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0"
                              aria-label={`Actions for ${category.name}`}
                            >
                              <Ellipsis className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(category)}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit category
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(category)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-3 border-t pt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Transactions
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {category.transactions}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Total amount
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {formatCurrency(category.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                  <Search className="size-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">No categories found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try another search or create a new category.
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    openCreateDialog();
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Add category
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create / Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSaveCategory}>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit category" : "Create category"}
                </DialogTitle>
                <DialogDescription>
                  Add a name and description for your{" "}
                  {activeTab === "expense" ? "expense" : "income"} category.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-5">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category name</Label>
                  <Input
                    id="category-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Subscriptions"
                    maxLength={60}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-description">
                    Description (Optional)
                  </Label>
                  <Input
                    id="category-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What belongs in this category?"
                    maxLength={150}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  {/* @ts-ignore */}
                  <Select value={iconName} onValueChange={setIconName}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableIcons.map((item) => {
                        const Icon = item.icon;

                        return (
                          <SelectItem key={item.value} value={item.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="size-4" />
                              {item.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {formError && (
                  <p role="alert" className="text-sm text-destructive">
                    {formError}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? "Save changes" : "Create category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete category?</DialogTitle>
              <DialogDescription>
                You are about to delete{" "}
                <span className="font-medium text-foreground">
                  {deleteTarget?.name}
                </span>
                . This removes it from this page's category list. Existing
                transaction history is not modified by this demo.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCategory}>
                <Trash2 className="mr-2 size-4" />
                Delete category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
