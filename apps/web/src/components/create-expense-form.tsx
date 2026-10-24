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
import type { FormEvent } from "react";

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
import { createTransaction } from "@/lib/api-client";
import { useFinanceOptions } from "@/lib/use-finance-options";

const categoryIcons: Record<string, typeof Utensils> = {
  food: Utensils,
  groceries: ShoppingCart,
  transport: Bus,
  shopping: ShoppingBag,
  utilities: Zap,
  housing: House,
  health: HeartPulse,
  education: GraduationCap,
  entertainment: Clapperboard,
  coffee: Coffee,
  mobile: Smartphone,
  business: BriefcaseBusiness,
  cash: Banknote,
  other: MoreHorizontal,
};

export default function CreateExpenseForm() {
  const { accounts, categories, isLoading: isLoadingOptions, error: optionsError } = useFinanceOptions("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    const title = String(formData.get("title") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const numericAmount = Number(amount);

    if (!title) {
      setError("Please enter an expense title.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (!category || !account || !date) {
      setError("Please select a category, account, and date.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createTransaction({
        type: "expense",
        amount: numericAmount,
        description: title,
        category,
        account,
        date,
        notes,
        paymentMethod: "other",
        status: "completed",
      });

      setSuccess("Expense saved successfully.");

      setAmount("");
      setCategory("");
      setAccount("");

      formElement.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while saving the expense.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
            {isLoadingOptions ? "Loading categories..." : `${categories.length} categories`}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {categories.map((item) => {
            const Icon = categoryIcons[item.icon] ?? MoreHorizontal;
            const selected = category === item._id;

            return (
              <button
                key={item._id}
                type="button"
                onClick={() => setCategory(item._id)}
                aria-pressed={selected}
                className={`flex min-h-22 flex-col items-center justify-center gap-2 rounded-lg border p-2 text-center transition-colors ${
                  selected
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted/50"
                }`}
              >
                <Icon className={`size-5 ${selected ? "text-primary" : ""}`} strokeWidth={1.8} />

                <span className="text-xs font-medium leading-tight">{item.name}</span>
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
                <SelectItem key={item._id} value={item._id}>
                  {item.name}
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

      {(optionsError || error) && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {optionsError || error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-600/20 bg-green-600/5 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}
      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">Check your details before saving.</p>

        <Button type="submit" disabled={isSubmitting} className="h-11 w-full sm:w-auto">
          {isSubmitting ? (
            "Saving..."
          ) : (
            <>
              <Plus className="mr-2 size-4" />
              Save expense
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
