import { useState } from "react";
import {
  ArrowDownUp,
  Banknote,
  BriefcaseBusiness,
  Bus,
  CalendarDays,
  Clapperboard,
  Coffee,
  GraduationCap,
  HeartPulse,
  House,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { id: "food", label: "Food & Dining", icon: Utensils },
  { id: "groceries", label: "Groceries", icon: ShoppingCart },
  { id: "transport", label: "Transport", icon: Bus },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "bills", label: "Bills & Utilities", icon: Zap },
  { id: "housing", label: "Housing", icon: House },
  { id: "health", label: "Healthcare", icon: HeartPulse },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "entertainment", label: "Entertainment", icon: Clapperboard },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "mobile", label: "Phone & Internet", icon: Smartphone },
  { id: "business", label: "Business", icon: BriefcaseBusiness },
  { id: "cash", label: "Cash Expense", icon: Banknote },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

const accounts = [
  { value: "cash", label: "Cash Wallet" },
  { value: "bank", label: "Bank Account" },
  { value: "savings", label: "Savings Account" },
];

export default function CreateExpenseForm() {
  const [category, setCategory] = useState("food");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const expense = {
      title: String(formData.get("title") ?? "").trim(),
      amount: Number(amount),
      category,
      account,
      date,
      notes: String(formData.get("notes") ?? "").trim(),
    };

    if (!expense.title || !Number.isFinite(expense.amount) || expense.amount <= 0) {
      return;
    }

    if (!expense.category || !expense.account || !expense.date) {
      return;
    }

    // TODO: Send expense to your API.
    console.log("Expense:", expense);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Amount */}
      <section className="rounded-xl border bg-muted/20 p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="size-4 text-muted-foreground" />
          <Label htmlFor="expense-amount" className="text-sm font-medium">
            Expense amount
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-3xl font-semibold text-muted-foreground">₹</span>

          <Input
            id="expense-amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            className="h-14 border-0 bg-transparent px-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
            required
          />
        </div>

        <p className="mt-2 text-xs text-muted-foreground">Enter the total amount you spent.</p>
      </section>

      {/* Title */}
      <section className="space-y-2">
        <Label htmlFor="expense-title">Expense title</Label>
        <Input
          id="expense-title"
          name="title"
          placeholder="e.g. Lunch with colleagues"
          className="h-11"
          maxLength={120}
          required
        />
      </section>

      {/* Categories */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="shrink-0 text-xs text-muted-foreground">
            {categories.length} categories
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {categories.map((item) => {
            const Icon = item.icon;
            const selected = category === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                aria-pressed={selected}
                className={`flex min-h-22 flex-col items-center justify-center gap-2 rounded-lg border p-2 text-center transition-colors ${
                  selected
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted/50"
                }`}
              >
                <Icon className={`size-5 ${selected ? "text-primary" : ""}`} strokeWidth={1.8} />

                <span className="text-xs font-medium leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Account and Date */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expense-account">Paid from</Label>

          {/*  @ts-ignore */}
          <Select value={account} onValueChange={setAccount} required>
            <SelectTrigger id="expense-account" className="h-11 w-full">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>

            <SelectContent>
              {accounts.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense-date">Expense date</Label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="expense-date"
              name="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-11 pl-9"
              required
            />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-2">
        <Label htmlFor="expense-notes">
          Notes <span className="font-normal text-muted-foreground">(Optional)</span>
        </Label>

        <Textarea
          id="expense-notes"
          name="notes"
          placeholder="Add a note about this expense..."
          className="min-h-24 resize-y"
          maxLength={1000}
        />
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">Check your details before saving.</p>

        <Button type="submit" className="h-11 w-full sm:w-auto">
          <Plus className="mr-2 size-4" />
          Save expense
        </Button>
      </div>
    </form>
  );
}
