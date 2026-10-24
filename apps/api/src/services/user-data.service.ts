import mongoose from "mongoose";
import UserData from "../model/user-data.model.js";

export type UserDataResource =
  | "budgets"
  | "goals"
  | "debts"
  | "recurring"
  | "notifications"
  | "preferences";

type DataRecord = Record<string, unknown>;

const fields: Record<UserDataResource, readonly string[]> = {
  budgets: ["name", "category", "categoryId", "limit", "period"],
  goals: ["name", "category", "target", "saved", "targetDate", "description"],
  debts: ["person", "type", "amount", "paid", "date", "dueDate", "note"],
  recurring: [
    "title", "category", "type", "amount", "account", "frequency",
    "startDate", "nextDate", "endDate", "status", "note",
  ],
  notifications: ["title", "description", "time", "type", "read"],
  preferences: [
    "monthlyBudget", "weekStartsOn", "dateFormat", "theme", "currency",
    "language", "expenseAlerts", "budgetAlerts", "incomeAlerts",
    "weeklySummary", "emailNotifications", "twoFactorAuth",
  ],
};

const requiredFields: Partial<Record<UserDataResource, readonly string[]>> = {
  budgets: ["name", "limit", "period"],
  goals: ["name", "target", "saved"],
  debts: ["person", "type", "amount", "paid", "date"],
  recurring: ["title", "type", "amount", "account", "frequency", "startDate", "nextDate", "status"],
  notifications: ["title", "description", "type", "read"],
};

const enumValues: Partial<Record<UserDataResource, Record<string, readonly unknown[]>>> = {
  budgets: { period: ["Weekly", "Monthly", "Yearly"] },
  debts: { type: ["lent", "borrowed"] },
  recurring: {
    type: ["expense", "income"],
    frequency: ["Weekly", "Monthly", "Yearly"],
    status: ["active", "paused"],
  },
  notifications: { type: ["expense", "budget", "goal", "account", "system"] },
  preferences: {
    weekStartsOn: ["Monday", "Sunday"],
    dateFormat: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
    theme: ["light", "dark", "system"],
  },
};

export class UserDataError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "UserDataError";
    this.statusCode = statusCode;
  }
}

export const isUserDataResource = (value: string): value is UserDataResource =>
  Object.prototype.hasOwnProperty.call(fields, value);

function validateData(resource: UserDataResource, data: DataRecord): void {
  const allowedFields = fields[resource];
  const unknownFields = Object.keys(data).filter((key) => !allowedFields.includes(key));
  if (unknownFields.length) {
    throw new UserDataError(`Unsupported ${resource} field: ${unknownFields[0]}`);
  }

  for (const key of requiredFields[resource] ?? []) {
    if (data[key] === undefined || data[key] === null || data[key] === "") {
      throw new UserDataError(`${key} is required`);
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && value.length > 2000) {
      throw new UserDataError(`${key} must be 2000 characters or fewer`);
    }

    const allowedValues = enumValues[resource]?.[key];
    if (allowedValues && !allowedValues.includes(value)) {
      throw new UserDataError(`Invalid ${key}`);
    }

    if (
      ["limit", "target", "saved", "amount", "paid"].includes(key) &&
      (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    ) {
      throw new UserDataError(`${key} must be a non-negative number`);
    }

    if (key === "monthlyBudget" && (typeof value !== "string" || !Number.isFinite(Number(value)) || Number(value) < 0)) {
      throw new UserDataError("monthlyBudget must be a non-negative number");
    }

    if (
      ["read", "expenseAlerts", "budgetAlerts", "incomeAlerts", "weeklySummary", "emailNotifications", "twoFactorAuth"].includes(key) &&
      typeof value !== "boolean"
    ) {
      throw new UserDataError(`${key} must be a boolean`);
    }

    if (
      ["date", "dueDate", "targetDate", "startDate", "nextDate", "endDate"].includes(key) &&
      value !== "" &&
      (typeof value !== "string" || Number.isNaN(new Date(value).getTime()))
    ) {
      throw new UserDataError(`${key} must be a valid date`);
    }
  }

  if (resource === "goals" && typeof data.saved === "number" && typeof data.target === "number" && data.saved > data.target) {
    throw new UserDataError("saved cannot exceed target");
  }

  if (resource === "debts" && typeof data.paid === "number" && typeof data.amount === "number" && data.paid > data.amount) {
    throw new UserDataError("paid cannot exceed amount");
  }
}

function normalizeDoc(doc: { _id: mongoose.Types.ObjectId; data: DataRecord; createdAt: Date; updatedAt: Date }) {
  return {
    ...doc.data,
    _id: String(doc._id),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listUserData(userId: string, resource: UserDataResource) {
  assertUserId(userId);
  const docs = await UserData.find({ userId, resource }).sort({ createdAt: -1 }).lean();
  return docs.map(normalizeDoc);
}

export async function createUserData(userId: string, resource: UserDataResource, input: DataRecord) {
  assertUserId(userId);
  assertDataRecord(input);
  validateData(resource, input);
  const doc = await UserData.create({ userId, resource, data: input });
  return normalizeDoc(doc);
}

export async function updateUserData(
  userId: string,
  resource: UserDataResource,
  id: string,
  input: DataRecord,
) {
  assertUserId(userId);
  assertDataRecord(input);
  if (!mongoose.isValidObjectId(id)) throw new UserDataError("Invalid record ID");

  const doc = await UserData.findOne({ _id: id, userId, resource });
  if (!doc) throw new UserDataError("Record not found", 404);

  const nextData = { ...(doc.data as DataRecord), ...input };
  validateData(resource, nextData);
  doc.data = nextData;
  await doc.save();
  return normalizeDoc(doc);
}

export async function deleteUserData(userId: string, resource: UserDataResource, id: string) {
  assertUserId(userId);
  if (!mongoose.isValidObjectId(id)) throw new UserDataError("Invalid record ID");

  const doc = await UserData.findOneAndDelete({ _id: id, userId, resource });
  if (!doc) throw new UserDataError("Record not found", 404);
  return { id: String(doc._id) };
}

function assertUserId(userId: string): void {
  if (!mongoose.isValidObjectId(userId)) {
    throw new UserDataError("Valid authenticated user ID is required", 401);
  }
}

function assertDataRecord(input: unknown): asserts input is DataRecord {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new UserDataError("Request body must be a JSON object");
  }
}
