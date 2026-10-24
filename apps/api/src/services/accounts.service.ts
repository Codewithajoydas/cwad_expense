import mongoose from "mongoose";

import Account from "../model/account.model.js";
import Transaction from "../model/transaction.model.js";

type AccountType =
  | "cash"
  | "bank"
  | "savings"
  | "credit_card"
  | "wallet"
  | "investment"
  | "other";

interface AccountPayload {
  name?: string;
  type?: AccountType;
  accountNumber?: string | null;
  institution?: string;
  currency?: string;
  openingBalance?: number;
  creditLimit?: number | null;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  isActive?: boolean;
  notes?: string;
}

interface AccountFilters {
  type?: AccountType;
  isActive?: string;
}

class AccountServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AccountServiceError";
    this.statusCode = statusCode;
  }
}

const isValidId = (id: string) =>
  mongoose.isValidObjectId(id);

const allowedAccountFields = [
  "name",
  "type",
  "accountNumber",
  "institution",
  "currency",
  "creditLimit",
  "color",
  "icon",
  "isDefault",
  "isActive",
  "notes",
] as const;





export const getAccountsServices = async (
  userId: string,
  filters: AccountFilters = {},
) => {
  if (!isValidId(userId)) {
    throw new AccountServiceError(
      "Valid authenticated user ID is required",
      401,
    );
  }

  const query: Record<string, unknown> = {
    userId,
  };

  if (filters.type) {
    const validTypes: AccountType[] = [
      "cash",
      "bank",
      "savings",
      "credit_card",
      "wallet",
      "investment",
      "other",
    ];

    if (!validTypes.includes(filters.type)) {
      throw new AccountServiceError("Invalid account type");
    }

    query.type = filters.type;
  }

  if (filters.isActive !== undefined) {
    if (!["true", "false"].includes(filters.isActive)) {
      throw new AccountServiceError(
        "isActive must be true or false",
      );
    }

    query.isActive = filters.isActive === "true";
  }

  const accounts = await Account.find(query)
    .select("+accountNumber")
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();

  return accounts;
};





export const addAccountService = async (
  userId: string,
  payload: AccountPayload,
) => {
  if (!isValidId(userId)) {
    throw new AccountServiceError(
      "Valid authenticated user ID is required",
      401,
    );
  }

  const {
    name,
    type,
    openingBalance = 0,
    ...otherFields
  } = payload;

  if (!name?.trim()) {
    throw new AccountServiceError(
      "Account name is required",
    );
  }

  const validTypes: AccountType[] = [
    "cash",
    "bank",
    "savings",
    "credit_card",
    "wallet",
    "investment",
    "other",
  ];

  if (!type || !validTypes.includes(type)) {
    throw new AccountServiceError("Invalid account type");
  }

  if (
    typeof openingBalance !== "number" ||
    !Number.isFinite(openingBalance)
  ) {
    throw new AccountServiceError(
      "Opening balance must be a valid number",
    );
  }

  const normalizedName = name.trim();

  const existingAccount = await Account.findOne({
    userId,
    name: normalizedName,
  });

  if (existingAccount) {
    throw new AccountServiceError(
      "An account with this name already exists",
      409,
    );
  }

  
  const accountData: Record<string, unknown> = {};

  for (const field of allowedAccountFields) {
    if (Object.prototype.hasOwnProperty.call(otherFields, field)) {
      accountData[field] = (
        otherFields as Record<string, unknown>
      )[field];
    }
  }

  
  accountData.isActive = true;

  const account = await Account.create({
    ...accountData,
    userId,
    name: normalizedName,
    type,
    openingBalance,
    currentBalance: openingBalance,
  });

  return account;
};





export const updateAccountService = async (
  userId: string,
  accountId: string,
  payload: AccountPayload,
) => {
  if (!isValidId(userId)) {
    throw new AccountServiceError(
      "Valid authenticated user ID is required",
      401,
    );
  }

  if (!isValidId(accountId)) {
    throw new AccountServiceError(
      "Invalid account ID",
    );
  }

  const account = await Account.findOne({
    _id: accountId,
    userId,
  });

  if (!account) {
    throw new AccountServiceError(
      "Account not found",
      404,
    );
  }

  
  if (
    Object.prototype.hasOwnProperty.call(
      payload,
      "openingBalance",
    )
  ) {
    throw new AccountServiceError(
      "Opening balance cannot be changed through this endpoint",
    );
  }

  if (
    payload.name !== undefined &&
    !payload.name.trim()
  ) {
    throw new AccountServiceError(
      "Account name cannot be empty",
    );
  }

  if (payload.name !== undefined) {
    const normalizedName = payload.name.trim();

    const duplicate = await Account.findOne({
      userId,
      name: normalizedName,
      _id: { $ne: accountId },
    });

    if (duplicate) {
      throw new AccountServiceError(
        "An account with this name already exists",
        409,
      );
    }

    account.name = normalizedName;
  }

  if (payload.type !== undefined) {
    const validTypes: AccountType[] = [
      "cash",
      "bank",
      "savings",
      "credit_card",
      "wallet",
      "investment",
      "other",
    ];

    if (!validTypes.includes(payload.type)) {
      throw new AccountServiceError(
        "Invalid account type",
      );
    }

    account.type = payload.type;
  }

  for (const field of allowedAccountFields) {
    if (
      field !== "name" &&
      field !== "type" &&
      Object.prototype.hasOwnProperty.call(payload, field)
    ) {
      account.set(
        field,
        payload[field as keyof AccountPayload],
      );
    }
  }

  await account.save();

  return account;
};





export const deleteAccountService = async (
  userId: string,
  accountId: string,
) => {
  if (!isValidId(userId)) {
    throw new AccountServiceError(
      "Valid authenticated user ID is required",
      401,
    );
  }

  if (!isValidId(accountId)) {
    throw new AccountServiceError(
      "Invalid account ID",
    );
  }

  const account = await Account.findOne({
    _id: accountId,
    userId,
  });

  if (!account) {
    throw new AccountServiceError(
      "Account not found",
      404,
    );
  }

  
  const hasTransactions = await Transaction.exists({
    userId,
    $or: [
      { account: accountId },
      { toAccount: accountId },
    ],
  });

  if (hasTransactions) {
    throw new AccountServiceError(
      "This account has transactions. Deactivate it instead of deleting it.",
      409,
    );
  }

  if (account.isDefault) {
    throw new AccountServiceError(
      "The default account cannot be deleted",
      409,
    );
  }

  await Account.deleteOne({
    _id: accountId,
    userId,
  });

  return {
    id: accountId,
    name: account.name,
  };
};