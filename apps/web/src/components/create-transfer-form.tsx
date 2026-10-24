
import { useState } from "react";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  CalendarDays,
  Check,
  Plus,
  Wallet,
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
import { createTransaction } from "@/lib/api-client";
import { useFinanceOptions } from "@/lib/use-finance-options";

export default function CreateTransferForm() {
  const { accounts, isLoading: isLoadingOptions, error: optionsError } = useFinanceOptions();
  const [amount, setAmount] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!fromAccount || !toAccount) {
      setError("Please select both accounts.");
      return;
    }

    if (fromAccount === toAccount) {
      setError("Source and destination accounts must be different.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createTransaction({
        type: "transfer",
        amount: numericAmount,
        account: fromAccount,
        toAccount,
        date,
        notes: String(formData.get("notes") ?? "").trim(),
        status: "completed",
      });
      setSuccess("Transfer recorded successfully.");
      setAmount("");
      setFromAccount("");
      setToAccount("");
      formElement.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save transfer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function swapAccounts() {
    setFromAccount(toAccount);
    setToAccount(fromAccount);
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Transfer Amount */}
      <section className="rounded-xl border bg-muted/20 p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <ArrowLeftRight className="size-4 text-muted-foreground" />
          <Label htmlFor="transfer-amount" className="text-sm font-medium">
            Transfer amount
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-3xl font-semibold text-muted-foreground">
            ₹
          </span>

          <Input
            id="transfer-amount"
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

        <p className="mt-2 text-xs text-muted-foreground">
          Enter the amount you want to move between accounts.
        </p>
      </section>

      {/* Account Selection */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Transfer between accounts</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose where the money comes from and where it goes.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="transfer-from">From account</Label>

            <Select
              value={fromAccount}
              onValueChange={(value) => {
                setFromAccount(value as string);
                setError("");
              }}
              required
            >
              <SelectTrigger id="transfer-from" className="h-12 w-full">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>

              <SelectContent>
                {accounts.map((account) => {
                  return (
                    <SelectItem key={account._id} value={account._id}>
                      <span className="flex items-center gap-2">
                        <Wallet className="size-4 text-muted-foreground" />
                        {account.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Swap */}
          <div className="flex justify-center pt-1 sm:pt-6">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={swapAccounts}
              disabled={!fromAccount || !toAccount}
              aria-label="Swap source and destination accounts"
              className="rounded-full"
            >
              <ArrowLeftRight className="size-4" />
            </Button>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="transfer-to">To account</Label>

            <Select
              value={toAccount}
              onValueChange={(value) => {
                setToAccount(value as string);
                setError("");
              }}
              required
            >
              <SelectTrigger id="transfer-to" className="h-12 w-full">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>

              <SelectContent>
                {accounts.map((account) => {
                  return (
                    <SelectItem key={account._id} value={account._id}>
                      <span className="flex items-center gap-2">
                        <Wallet className="size-4 text-muted-foreground" />
                        {account.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {fromAccount && toAccount && fromAccount !== toAccount && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/20 p-3 text-sm">
            <Check className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Money will move from{" "}
              <span className="font-medium text-foreground">
                {accounts.find((item) => item._id === fromAccount)?.name}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {accounts.find((item) => item._id === toAccount)?.name}
              </span>
              .
            </span>
          </div>
        )}
      </section>

      {/* Date */}
      <section className="space-y-2">
        <Label htmlFor="transfer-date">Transfer date</Label>

        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="transfer-date"
            name="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-11 pl-9"
            required
          />
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-2">
        <Label htmlFor="transfer-notes">
          Notes{" "}
          <span className="font-normal text-muted-foreground">
            (Optional)
          </span>
        </Label>

        <Textarea
          id="transfer-notes"
          name="notes"
          placeholder="e.g. Moving savings to bank account..."
          className="min-h-24 resize-y"
          maxLength={1000}
        />
      </section>

      {/* Validation */}
      {(optionsError || error) && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {optionsError || error}
        </p>
      )}
      {success && <p role="status" className="text-sm text-green-700">{success}</p>}

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Review both accounts before confirming.
        </p>

        <Button type="submit" disabled={isSubmitting || isLoadingOptions} className="h-11 w-full sm:w-auto">
          {isSubmitting ? "Saving..." : <><ArrowLeftRight className="mr-2 size-4" />Transfer money</>}
        </Button>
      </div>
    </form>
  );
}
