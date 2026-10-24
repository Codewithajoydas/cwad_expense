import { env } from "@/config/env";

export type AccountType =
  | "cash"
  | "bank"
  | "savings"
  | "credit_card"
  | "wallet"
  | "investment"
  | "other";

export type CategoryType = "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer";

export interface Account {
  _id: string;
  name: string;
  type: AccountType;
  accountNumber: string | null;
  institution: string;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  creditLimit: number | null;
  color: string;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  type: CategoryType;
  description: string;
  icon: string;
  color: string;
  parentCategory: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: Category | string | null;
  account: Account | string;
  toAccount?: Account | string | null;
  date: string;
  paymentMethod: "cash" | "card" | "bank_transfer" | "upi" | "wallet" | "other";
  status: "completed" | "pending" | "cancelled";
  notes: string;
  tags: string[];
}

export interface Budget {
  _id: string;
  name: string;
  category: string;
  categoryId?: string;
  limit: number;
  spent?: number;
  period: "Weekly" | "Monthly" | "Yearly";
}

export interface Goal {
  _id: string;
  name: string;
  category: string;
  target: number;
  saved: number;
  targetDate: string;
  description: string;
}

export interface Debt {
  _id: string;
  person: string;
  type: "lent" | "borrowed";
  amount: number;
  paid: number;
  date: string;
  dueDate: string;
  note: string;
}

export interface RecurringSchedule {
  _id: string;
  title: string;
  category: string;
  type: "expense" | "income";
  amount: number;
  account: string;
  frequency: "Weekly" | "Monthly" | "Yearly";
  startDate: string;
  nextDate: string;
  endDate: string;
  status: "active" | "paused";
  note: string;
}

export interface Notification {
  _id: string;
  title: string;
  description: string;
  time: string;
  type: "expense" | "budget" | "goal" | "account" | "system";
  read: boolean;
}

export interface UserPreferences {
  _id: string;
  monthlyBudget: string;
  weekStartsOn: string;
  dateFormat: string;
  theme: string;
  currency: string;
  language: string;
  expenseAlerts: boolean;
  budgetAlerts: boolean;
  incomeAlerts: boolean;
  weeklySummary: boolean;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const text = await response.text();
  let result: unknown;
  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(`API returned an invalid response (${response.status}).`);
    }
  }

  if (!response.ok) {
    const error = result as { message?: string; error?: string } | undefined;
    throw new Error(error?.message ?? error?.error ?? `Request failed (${response.status}).`);
  }

  return result as T;
}

function jsonBody(body: unknown): string {
  return JSON.stringify(body);
}

export async function getAccounts(filters: { type?: AccountType; isActive?: boolean } = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
  const queryString = params.toString();
  const query = queryString ? `?${queryString}` : "";
  const result = await request<ApiResponse<Account[]> & { count: number }>(`/api/accounts${query}`);
  if (!Array.isArray(result.data)) throw new Error("The API returned an invalid accounts list.");
  return result.data;
}

export async function createAccount(body: {
  name: string;
  type: AccountType;
  openingBalance: number;
  institution?: string;
  accountNumber?: string | null;
}) {
  const result = await request<ApiResponse<Account>>("/api/accounts", {
    method: "POST",
    body: jsonBody(body),
  });
  if (!result.data) throw new Error("The API did not return the created account.");
  return result.data;
}

export async function updateAccount(id: string, body: Partial<Account>) {
  const result = await request<ApiResponse<Account>>(`/api/accounts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: jsonBody(body),
  });
  if (!result.data) throw new Error("The API did not return the updated account.");
  return result.data;
}

export async function deleteAccount(id: string) {
  return request<ApiResponse<{ id: string; name: string }>>(
    `/api/accounts/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export async function getCategories(filters: { type?: CategoryType; isActive?: boolean } = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
  const queryString = params.toString();
  const query = queryString ? `?${queryString}` : "";
  const result = await request<ApiResponse<Category[]> & { count: number }>(`/api/categories${query}`);
  if (!Array.isArray(result.data)) throw new Error("The API returned an invalid categories list.");
  return result.data;
}

export async function createCategory(body: {
  name: string;
  type: CategoryType;
  description?: string;
  icon?: string;
}) {
  const result = await request<ApiResponse<Category>>("/api/categories", {
    method: "POST",
    body: jsonBody(body),
  });
  if (!result.data) throw new Error("The API did not return the created category.");
  return result.data;
}

export async function updateCategory(id: string, body: Partial<Category>) {
  const result = await request<ApiResponse<Category>>(`/api/categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: jsonBody(body),
  });
  if (!result.data) throw new Error("The API did not return the updated category.");
  return result.data;
}

export async function deleteCategory(id: string) {
  return request<ApiResponse<{ id: string; name: string }>>(
    `/api/categories/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export async function getTransactions(filters: {
  type?: TransactionType;
  status?: Transaction["status"];
  account?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const queryString = params.toString();
  const query = queryString ? `?${queryString}` : "";
  const result = await request<{
    success: boolean;
    message: string;
    transactions: Transaction[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>(`/api/transactions${query}`);
  return result;
}

export async function getAllTransactions(
  filters: Omit<Parameters<typeof getTransactions>[0], "page" | "limit"> = {},
) {
  const firstPage = await getTransactions({ ...filters, page: 1, limit: 100 });
  const pages = [firstPage.transactions];

  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const result = await getTransactions({ ...filters, page, limit: 100 });
    pages.push(result.transactions);
  }

  return pages.flat();
}

export async function createTransaction(body: {
  type: TransactionType;
  amount: number;
  description?: string;
  category?: string | null;
  account: string;
  toAccount?: string | null;
  date?: string;
  paymentMethod?: Transaction["paymentMethod"];
  status?: Transaction["status"];
  notes?: string;
}) {
  const result = await request<ApiResponse<Transaction>>("/api/transactions", {
    method: "POST",
    body: jsonBody(body),
  });
  if (!result.data) throw new Error("The API did not return the created transaction.");
  return result.data;
}

export async function deleteTransaction(id: string) {
  return request<ApiResponse<Transaction>>(
    `/api/transactions/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

async function getUserData<T>(resource: string): Promise<T[]> {
  const result = await request<ApiResponse<T[]> & { count: number }>(`/api/data/${resource}`);
  if (!Array.isArray(result.data)) throw new Error(`The API returned an invalid ${resource} list.`);
  return result.data;
}

async function createUserData<T>(resource: string, body: Omit<T, "_id">): Promise<T> {
  const result = await request<ApiResponse<T>>(`/api/data/${resource}`, {
    method: "POST",
    body: jsonBody(body),
  });
  if (!result.data) throw new Error(`The API did not return the created ${resource} record.`);
  return result.data;
}

async function updateUserData<T>(resource: string, id: string, body: Partial<T>): Promise<T> {
  const result = await request<ApiResponse<T>>(`/api/data/${resource}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: jsonBody(body),
  });
  if (!result.data) throw new Error(`The API did not return the updated ${resource} record.`);
  return result.data;
}

async function deleteUserData(resource: string, id: string) {
  return request<ApiResponse<{ id: string }>>(
    `/api/data/${resource}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export const getBudgets = () => getUserData<Budget>("budgets");
export const createBudget = (body: Omit<Budget, "_id" | "spent">) =>
  createUserData<Budget>("budgets", body);
export const updateBudget = (id: string, body: Partial<Budget>) =>
  updateUserData<Budget>("budgets", id, body);
export const deleteBudget = (id: string) => deleteUserData("budgets", id);

export const getGoals = () => getUserData<Goal>("goals");
export const createGoal = (body: Omit<Goal, "_id">) => createUserData<Goal>("goals", body);
export const updateGoal = (id: string, body: Partial<Goal>) =>
  updateUserData<Goal>("goals", id, body);
export const deleteGoal = (id: string) => deleteUserData("goals", id);

export const getDebts = () => getUserData<Debt>("debts");
export const createDebt = (body: Omit<Debt, "_id">) => createUserData<Debt>("debts", body);
export const updateDebt = (id: string, body: Partial<Debt>) =>
  updateUserData<Debt>("debts", id, body);
export const deleteDebt = (id: string) => deleteUserData("debts", id);

export const getRecurringSchedules = () => getUserData<RecurringSchedule>("recurring");
export const createRecurringSchedule = (body: Omit<RecurringSchedule, "_id">) =>
  createUserData<RecurringSchedule>("recurring", body);
export const updateRecurringSchedule = (id: string, body: Partial<RecurringSchedule>) =>
  updateUserData<RecurringSchedule>("recurring", id, body);
export const deleteRecurringSchedule = (id: string) => deleteUserData("recurring", id);

export const getNotifications = () => getUserData<Notification>("notifications");
export const createNotification = (body: Omit<Notification, "_id">) =>
  createUserData<Notification>("notifications", body);
export const updateNotification = (id: string, body: Partial<Notification>) =>
  updateUserData<Notification>("notifications", id, body);
export const deleteNotification = (id: string) => deleteUserData("notifications", id);

export async function getPreferences(): Promise<UserPreferences | undefined> {
  return (await getUserData<UserPreferences>("preferences"))[0];
}

export const savePreferences = (body: Omit<UserPreferences, "_id">) =>
  getPreferences().then((existing) =>
    existing
      ? updateUserData<UserPreferences>("preferences", existing._id, body)
      : createUserData<UserPreferences>("preferences", body),
  );
