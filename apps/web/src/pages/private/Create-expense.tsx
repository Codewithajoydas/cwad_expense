
import CreateExpenseForm from "@/components/create-expense-form";
import CreateIncomeForm from "@/components/create-income-form";
import CreateTransferForm from "@/components/create-transfer-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function CreateExpense() {
  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <Tabs defaultValue="expense" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="pt-4">
          <CreateExpenseForm />
        </TabsContent>

        <TabsContent value="income" className="pt-4">
          <CreateIncomeForm />
        </TabsContent>

        <TabsContent value="transfer" className="pt-4">
          <CreateTransferForm />
        </TabsContent>
      </Tabs>
    </main>
  );
}
