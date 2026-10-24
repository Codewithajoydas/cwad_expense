import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than zero"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "card",
        "bank_transfer",
        "upi",
        "wallet",
        "other",
      ],
      default: "other",
    },

    status: {
      type: String,
      enum: ["completed", "pending", "cancelled"],
      default: "completed",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    isRecurring: {
      type: Boolean,
      default: false,
    },

    recurringTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recurring",
      default: null,
    },

    receiptUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


transactionSchema.index({
  userId: 1,
  date: -1,
});


transactionSchema.index({
  userId: 1,
  type: 1,
  date: -1,
});

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);

export default Transaction;