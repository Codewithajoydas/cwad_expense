import { useState } from "react";
import {
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  Gift,
  HandCoins,
  Laptop,
  Landmark,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Wallet,
  Building2,
  House,
  CircleDollarSign,
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

const incomeSources = [
  { id: "salary", label: "Salary", icon: BriefcaseBusiness },
  { id: "freelance", label: "Freelancing", icon: Laptop },
  { id: "business", label: "Business", icon: Building2 },
  { id: "investment", label: "Investments", icon: TrendingUp },
  { id: "rental", label: "Rental Income", icon: House },
  { id: "interest", label: "Interest", icon: Landmark },
  { id: "bonus", label: "Bonus", icon: CircleDollarSign },
  { id: "gift", label: "Gift", icon: Gift },
  { id: "refund", label: "Refund", icon: HandCoins },
  { id: "cash", label: "Cash Income", icon: Banknote },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

const accounts = [
  { value: "cash", label: "Cash Wallet" },
  { value: "bank", label: "Bank Account" },
  { value: "savings", label: "Savings Account" },
];

export default function CreateIncomeForm() {
  const [source, setSource] = useState("salary");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const income = {
      title: String(formData.get("title") ?? "").trim(),
      amount: Number(amount),
      source,
      account,
      date,
      notes: String(formData.get("notes") ?? "").trim(),
    };

    if (
      !income.title ||
      !Number.isFinite(income.amount) ||
      income.amount <= 0 ||
      !income.account ||
      !income.date
    ) {
      return;
    }

    // TODO: Send income to your API.
    console.log("Income:", income);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Amount */}
      <section className="rounded-xl border bg-muted/20 p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="size-4 text-muted-foreground" />
          <Label htmlFor="income-amount" className="text-sm font-medium">
            Income amount
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-3xl font-semibold text-muted-foreground">₹</span>

          <Input
            id="income-amount"
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

        <p className="mt-2 text-xs text-muted-foreground">Enter the total amount you received.</p>
      </section>

      {/* Title */}
      <section className="space-y-2">
        <Label htmlFor="income-title">Income title</Label>
        <Input
          id="income-title"
          name="title"
          placeholder="e.g. October salary"
          className="h-11"
          maxLength={120}
          required
        />
      </section>

      {/* Income Sources */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label className="text-sm font-semibold">Income source</Label>
            <p className="mt-1 text-xs text-muted-foreground">Select where this money came from.</p>
          </div>

          <span className="shrink-0 text-xs text-muted-foreground">
            {incomeSources.length} sources
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {incomeSources.map((item) => {
            const Icon = item.icon;
            const selected = source === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSource(item.id)}
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
          <Label htmlFor="income-account">Deposit to</Label>

          {/* @ts-ignore */}
          <Select value={account} onValueChange={setAccount} required>
            <SelectTrigger id="income-account" className="h-11 w-full">
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
          <Label htmlFor="income-date">Received date</Label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="income-date"
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
        <Label htmlFor="income-notes">
          Notes <span className="font-normal text-muted-foreground">(Optional)</span>
        </Label>

        <Textarea
          id="income-notes"
          name="notes"
          placeholder="Add details about this income..."
          className="min-h-24 resize-y"
          maxLength={1000}
        />
      </section>

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Verify the amount and account before saving.
        </p>

        <Button type="submit" className="h-11 w-full sm:w-auto">
          <Plus className="mr-2 size-4" />
          Save income
        </Button>
      </div>
    </form>
  );
}
