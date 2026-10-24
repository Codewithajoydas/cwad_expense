import mongoose from "mongoose";

const userDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    resource: {
      type: String,
      enum: ["budgets", "goals", "debts", "recurring", "notifications", "preferences"],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userDataSchema.index({ userId: 1, resource: 1, createdAt: -1 });
userDataSchema.index(
  { userId: 1, resource: 1 },
  { unique: true, partialFilterExpression: { resource: "preferences" } },
);

const UserData = mongoose.model("UserData", userDataSchema);

export default UserData;
