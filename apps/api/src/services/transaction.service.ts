import mongoose, {
  type ClientSession,
} from "mongoose";

import Transaction from "../model/transaction.model.js";
import Account from "../model/account.model.js";
import Category from "../model/category.model.js";
import UserData from "../model/user-data.model.js";


type TransactionType = "income" | "expense" | "transfer";

type TransactionStatus = "completed" | "pending" | "cancelled";

type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "upi"
  | "wallet"
  | "other";

interface TransactionPayload {
  type: TransactionType;
  amount: number;
  description?: string;
  category?: string | null;
  account: string;
  toAccount?: string | null;
  date?: Date | string;
  paymentMethod?: PaymentMethod;
  status?: TransactionStatus;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringTransaction?: string | null;
  receiptUrl?: string | null;
}

interface TransactionFilters {
  type?: string;
  status?: string;
  account?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: string | number;
  limit?: string | number;
}

interface TransactionData {
  type: TransactionType;
  amount: number;
  description?: string;
  category?: string | mongoose.Types.ObjectId | null;
  account: string | mongoose.Types.ObjectId;
  toAccount?: string | mongoose.Types.ObjectId | null;
  date?: Date | string;
  paymentMethod?: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringTransaction?: string | null;
  receiptUrl?: string | null;
}

interface TransactionFindFilter {
  userId: mongoose.Types.ObjectId;
  type?: TransactionType;
  status?: TransactionStatus;
  $or?: Array<{
    account?: mongoose.Types.ObjectId;
    toAccount?: mongoose.Types.ObjectId;
  }>;
  category?: mongoose.Types.ObjectId;
  date?: { $gte?: Date; $lte?: Date };
}

interface BalanceEffectTransaction {
  type: TransactionType;
  amount: number;
  account: string | mongoose.Types.ObjectId;
  toAccount?: string | mongoose.Types.ObjectId | null;
  status: TransactionStatus;
}

interface BalanceChange {
  accountId: string | mongoose.Types.ObjectId;
  delta: number;
}

const allowedFields = [
  "type",
  "amount",
  "description",
  "category",
  "account",
  "toAccount",
  "date",
  "paymentMethod",
  "status",
  "notes",
  "tags",
  "isRecurring",
  "recurringTransaction",
  "receiptUrl",
] as const;

const isValidId = (id: unknown): id is string =>
  typeof id === "string" && mongoose.isValidObjectId(id);

const normalizeId = (
  id: string | mongoose.Types.ObjectId | null | undefined,
): string | null => (id ? String(id) : null);

const hasOwn = <T extends object>(
  object: T,
  key: PropertyKey,
): boolean => Object.prototype.hasOwnProperty.call(object, key);





const validateAccount = async (
  accountId: string,
  userId: string,
  session: ClientSession,
) => {
  if (!accountId || !isValidId(accountId)) {
    throw new Error("A valid account ID is required");
  }

  const account = await Account.findOne({
    _id: accountId,
    userId,
    isActive: true,
  }).session(session);

  if (!account) {
    throw new Error("Account not found or unavailable");
  }

  return account;
};





const validateTransaction = async (
  data: TransactionData,
  userId: string,
  session: ClientSession,
) => {
  if (!["income", "expense", "transfer"].includes(data.type)) {
    throw new Error("Invalid transaction type");
  }

  if (
    typeof data.amount !== "number" ||
    !Number.isFinite(data.amount) ||
    data.amount <= 0
  ) {
    throw new Error("Amount must be a positive number");
  }

  if (
    !["completed", "pending", "cancelled"].includes(data.status)
  ) {
    throw new Error("Invalid transaction status");
  }

  await validateAccount(String(data.account), userId, session);

  if (data.type === "transfer") {
    if (!data.toAccount || !isValidId(String(data.toAccount))) {
      throw new Error(
        "Destination account is required for transfers",
      );
    }

    if (normalizeId(data.account) === normalizeId(data.toAccount)) {
      throw new Error(
        "Source and destination accounts must be different",
      );
    }

    await validateAccount(String(data.toAccount), userId, session);
  } else if (data.toAccount) {
    throw new Error(
      "Destination account is only allowed for transfers",
    );
  }

  if (data.category) {
    if (!isValidId(String(data.category))) {
      throw new Error("Invalid category ID");
    }

    if (data.type === "transfer") {
      throw new Error(
        "Transfers cannot have an income or expense category",
      );
    }

    const category = await Category.findOne({
      _id: data.category,
      userId,
      isActive: true,
      type: data.type,
    }).session(session);

    if (!category) {
      throw new Error(
        "Category not found or does not match transaction type",
      );
    }
  }

  if (
    data.date !== undefined &&
    Number.isNaN(new Date(data.date).getTime())
  ) {
    throw new Error("Invalid transaction date");
  }
};





const applyBalanceEffect = async (
  transaction: BalanceEffectTransaction,
  direction: 1 | -1,
  userId: string,
  session: ClientSession,
): Promise<void> => {
  if (transaction.status !== "completed") {
    return;
  }

  const amount = transaction.amount * direction;

  const changes: BalanceChange[] = [];

  if (transaction.type === "income") {
    changes.push({
      accountId: transaction.account,
      delta: amount,
    });
  } else if (transaction.type === "expense") {
    changes.push({
      accountId: transaction.account,
      delta: -amount,
    });
  } else if (transaction.type === "transfer") {
    if (!transaction.toAccount) {
      throw new Error("Destination account is required for transfers");
    }

    changes.push(
      {
        accountId: transaction.account,
        delta: -amount,
      },
      {
        accountId: transaction.toAccount,
        delta: amount,
      },
    );
  }

  for (const change of changes) {
    const result = await Account.updateOne(
      {
        _id: change.accountId,
        userId,
      },
      {
        $inc: {
          currentBalance: change.delta,
        },
      },
      {
        session,
      },
    );

    if (result.matchedCount !== 1) {
      throw new Error(
        "Account not found while updating balance",
      );
    }
  }
};





export const addTransactionService = async (
  userId: string,
  payload: TransactionPayload,
) => {
  if (!isValidId(userId)) {
    throw new Error("Valid authenticated user ID is required");
  }

  const session = await mongoose.startSession();

  try {
    let createdTransaction:
      | Awaited<ReturnType<typeof Transaction.create>>[number]
      | undefined;

    await session.withTransaction(async () => {
      const data: TransactionData = {
        type: payload.type,
        amount: payload.amount,
        description: payload.description,
        category: payload.category || null,
        account: payload.account,
        toAccount: payload.toAccount || null,
        date: payload.date || new Date(),
        paymentMethod: payload.paymentMethod || "other",
        status: payload.status || "completed",
        notes: payload.notes || "",
        tags: payload.tags || [],
        isRecurring: payload.isRecurring ?? false,
        recurringTransaction: payload.recurringTransaction || null,
        receiptUrl: payload.receiptUrl || null,
      };

      await validateTransaction(data, userId, session);

      const [transaction] = await Transaction.create(
        [
          {
            ...data,
            userId,
          },
        ],
        { session },
      );
      if (!transaction) throw new Error("Transaction creation failed");

      await applyBalanceEffect(
        transaction,
        1,
        userId,
        session,
      );

      await UserData.create(
        [
          {
            userId,
            resource: "notifications",
            data: {
              title: `${data.type.charAt(0).toUpperCase()}${data.type.slice(1)} recorded`,
              description: `${data.type} of ${data.amount} ${data.status === "completed" ? "was recorded" : `was marked ${data.status}`}.`,
              time: new Date().toISOString(),
              type: data.type === "transfer" ? "account" : data.type,
              read: false,
            },
          },
        ],
        { session },
      );

      if (transaction) createdTransaction = transaction;
    });

    return createdTransaction;
  } finally {
    await session.endSession();
  }
};





export const getTransactionService = async (
  userId: string,
  filters: TransactionFilters = {},
) => {
  if (!isValidId(userId)) {
    throw new Error("Valid authenticated user ID is required");
  }

  const query: TransactionFindFilter = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (filters.type) {
    if (!["income", "expense", "transfer"].includes(filters.type)) {
      throw new Error("Invalid transaction type filter");
    }

    query.type = filters.type as TransactionType;
  }

  if (filters.status) {
    if (
      !["completed", "pending", "cancelled"].includes(filters.status)
    ) {
      throw new Error("Invalid transaction status filter");
    }

    query.status = filters.status as TransactionStatus;
  }

  if (filters.account) {
    if (!isValidId(filters.account)) {
      throw new Error("Invalid account ID filter");
    }

    const accountId = new mongoose.Types.ObjectId(filters.account);

    query.$or = [
      { account: accountId },
      { toAccount: accountId },
    ];
  }

  if (filters.category) {
    if (!isValidId(filters.category)) {
      throw new Error("Invalid category ID filter");
    }

    query.category = new mongoose.Types.ObjectId(filters.category);
  }

  if (filters.startDate || filters.endDate) {
    const dateFilter: {
      $gte?: Date;
      $lte?: Date;
    } = {};

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);

      if (Number.isNaN(startDate.getTime())) {
        throw new Error("Invalid start date");
      }

      dateFilter.$gte = startDate;
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);

      if (Number.isNaN(endDate.getTime())) {
        throw new Error("Invalid end date");
      }

      dateFilter.$lte = endDate;
    }

    if (
      dateFilter.$gte &&
      dateFilter.$lte &&
      dateFilter.$gte > dateFilter.$lte
    ) {
      throw new Error("Start date must not be after end date");
    }

    query.date = dateFilter;
  }

  const page = Math.max(
    1,
    Number.parseInt(String(filters.page ?? ""), 10) || 1,
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number.parseInt(String(filters.limit ?? ""), 10) || 20,
    ),
  );

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate("account", "name type currency")
      .populate("toAccount", "name type currency")
      .populate("category", "name type icon color")
      .lean(),

    Transaction.countDocuments(query),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};





export const updateTransactionService = async (
  userId: string,
  transactionId: string,
  payload: Partial<TransactionPayload>,
) => {
  if (!isValidId(userId)) {
    throw new Error("Valid authenticated user ID is required");
  }

  if (!isValidId(transactionId)) {
    throw new Error("Invalid transaction ID");
  }

  const session = await mongoose.startSession();

  try {
    let updatedTransaction:
      | Awaited<ReturnType<typeof Transaction.findById>>
      | undefined;

    await session.withTransaction(async () => {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId,
      }).session(session);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      const oldData = transaction.toObject() as BalanceEffectTransaction;

      for (const field of allowedFields) {
        if (hasOwn(payload, field)) {
          transaction.set(
            field,
            payload[field as keyof TransactionPayload],
          );
        }
      }

      if (hasOwn(payload, "category") && !payload.category) {
        transaction.set("category", null);
      }

      if (hasOwn(payload, "toAccount") && !payload.toAccount) {
        transaction.set("toAccount", null);
      }

      await validateTransaction(
        transaction.toObject() as TransactionData,
        userId,
        session,
      );

      
      await applyBalanceEffect(
        oldData,
        -1,
        userId,
        session,
      );

      await transaction.save({ session });

      
      await applyBalanceEffect(
        transaction,
        1,
        userId,
        session,
      );

      updatedTransaction = transaction;
    });

    return updatedTransaction;
  } finally {
    await session.endSession();
  }
};





export const deleteTransactionService = async (
  userId: string,
  transactionId: string,
) => {
  if (!isValidId(userId)) {
    throw new Error("Valid authenticated user ID is required");
  }

  if (!isValidId(transactionId)) {
    throw new Error("Invalid transaction ID");
  }

  const session = await mongoose.startSession();

  try {
    let deletedTransaction:
      | Awaited<ReturnType<typeof Transaction.findById>>
      | undefined;

    await session.withTransaction(async () => {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId,
      }).session(session);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      await applyBalanceEffect(
        transaction,
        -1,
        userId,
        session,
      );

      await transaction.deleteOne({ session });

      deletedTransaction = transaction;
    });

    return deletedTransaction;
  } finally {
    await session.endSession();
  }
};