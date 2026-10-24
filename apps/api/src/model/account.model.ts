import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
      maxlength: 100,
    },

    type: {
      type: String,
      enum: [
        "cash",
        "bank",
        "savings",
        "credit_card",
        "wallet",
        "investment",
        "other",
      ],
      required: true,
    },

    accountNumber: {
      type: String,
      trim: true,
      default: null,
      select: false,
    },

    institution: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "INR",
      match: /^[A-Z]{3}$/,
    },

    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },

    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },

    creditLimit: {
      type: Number,
      min: 0,
      default: null,
    },

    color: {
      type: String,
      default: "#64748b",
    },

    icon: {
      type: String,
      default: "wallet",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

accountSchema.index({
  userId: 1,
  isActive: 1,
});

accountSchema.index(
  { userId: 1, name: 1 },
  { unique: true }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;