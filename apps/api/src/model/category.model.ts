import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 100,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    icon: {
      type: String,
      default: "tag",
    },

    color: {
      type: String,
      default: "#64748b",
    },

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent duplicate category names for the same user and type.
categorySchema.index(
  { userId: 1, name: 1, type: 1 },
  { unique: true }
);

// Efficient category listing.
categorySchema.index({
  userId: 1,
  type: 1,
  isActive: 1,
  sortOrder: 1,
});

const Category = mongoose.model("Category", categorySchema);

export default Category;