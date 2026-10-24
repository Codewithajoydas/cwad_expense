import mongoose from "mongoose";

import Category from "../model/category.model.js";
import Transaction from "../model/transaction.model.js";

type CategoryType = "income" | "expense";

interface CategoryPayload {
  name?: string;
  type?: CategoryType;
  description?: string;
  icon?: string;
  color?: string;
  parentCategory?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

interface CategoryFilters {
  type?: CategoryType;
  isActive?: string;
}

class CategoryServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "CategoryServiceError";
    this.statusCode = statusCode;
  }
}

const isValidId = (id: string) =>
  mongoose.isValidObjectId(id);

const validTypes: CategoryType[] = ["income", "expense"];

type DefaultCategory = {
  name: string;
  type: CategoryType;
  description: string;
  icon: string;
  sortOrder: number;
};

const defaultCategories: DefaultCategory[] = [
  {
    name: "Food & Dining",
    type: "expense",
    description: "Meals, restaurants and food purchases",
    icon: "food",
    sortOrder: 10,
  },
  {
    name: "Groceries",
    type: "expense",
    description: "Groceries and household essentials",
    icon: "groceries",
    sortOrder: 20,
  },
  {
    name: "Transportation",
    type: "expense",
    description: "Travel, fuel and commuting",
    icon: "transport",
    sortOrder: 30,
  },
  {
    name: "Shopping",
    type: "expense",
    description: "Clothing and personal purchases",
    icon: "shopping",
    sortOrder: 40,
  },
  {
    name: "Housing",
    type: "expense",
    description: "Rent and household expenses",
    icon: "housing",
    sortOrder: 50,
  },
  {
    name: "Bills & Utilities",
    type: "expense",
    description: "Electricity, internet and utility bills",
    icon: "utilities",
    sortOrder: 60,
  },
  {
    name: "Healthcare",
    type: "expense",
    description: "Medical and health expenses",
    icon: "health",
    sortOrder: 70,
  },
  {
    name: "Education",
    type: "expense",
    description: "Courses, books and learning",
    icon: "education",
    sortOrder: 80,
  },
  {
    name: "Entertainment",
    type: "expense",
    description: "Movies and recreation",
    icon: "entertainment",
    sortOrder: 90,
  },
  {
    name: "Other",
    type: "expense",
    description: "Miscellaneous spending",
    icon: "other",
    sortOrder: 100,
  },
  {
    name: "Salary",
    type: "income",
    description: "Employment income",
    icon: "salary",
    sortOrder: 10,
  },
  {
    name: "Freelancing",
    type: "income",
    description: "Freelance and contract work",
    icon: "freelance",
    sortOrder: 20,
  },
  {
    name: "Business",
    type: "income",
    description: "Business earnings",
    icon: "business",
    sortOrder: 30,
  },
  {
    name: "Investments",
    type: "income",
    description: "Investment returns and dividends",
    icon: "investment",
    sortOrder: 40,
  },
  {
    name: "Rental Income",
    type: "income",
    description: "Property rental earnings",
    icon: "rental",
    sortOrder: 50,
  },
  {
    name: "Interest",
    type: "income",
    description: "Interest income",
    icon: "interest",
    sortOrder: 60,
  },
  {
    name: "Gifts",
    type: "income",
    description: "Money received as gifts",
    icon: "gift",
    sortOrder: 70,
  },
  {
    name: "Refunds",
    type: "income",
    description: "Refunds and returned payments",
    icon: "refund",
    sortOrder: 80,
  },
  {
    name: "Other Income",
    type: "income",
    description: "Other money received",
    icon: "other",
    sortOrder: 90,
  },
];

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

async function ensureDefaultCategories(userId: string): Promise<void> {
  try {
    await Category.bulkWrite(
      defaultCategories.map((category) => ({
        updateOne: {
          filter: {
            userId,
            name: category.name,
            type: category.type,
          },
          update: {
            $setOnInsert: {
              userId,
              ...category,
              isDefault: true,
              isActive: true,
              color: "#64748b",
              parentCategory: null,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    const existingDefaultCount = await Category.countDocuments({
      userId,
      $or: defaultCategories.map(({ name, type }) => ({ name, type })),
    });

    if (existingDefaultCount !== defaultCategories.length) {
      throw error;
    }
  }
}




export const getCategoriesService = async (
  userId: string,
  filters: CategoryFilters = {},
) => {
  if (!isValidId(userId)) {
    throw new CategoryServiceError(
      "Valid authenticated user ID is required",
      401,
    );
  }

  const query: Record<string, unknown> = { userId };

  if (filters.type) {
    if (!validTypes.includes(filters.type)) {
      throw new CategoryServiceError("Invalid category type");
    }

    query.type = filters.type;
  }

  if (filters.isActive !== undefined) {
    if (!["true", "false"].includes(filters.isActive)) {
      throw new CategoryServiceError(
        "isActive must be true or false",
      );
    }

    query.isActive = filters.isActive === "true";
  }

  await ensureDefaultCategories(userId);

  return Category.find(query)
    .sort({ sortOrder: 1, name: 1 })
    .lean();
};





export const addCategoryService = async (
  userId: string,
  payload: CategoryPayload,
) => {
  if (!isValidId(userId)) {
    throw new CategoryServiceError(
      "Valid authenticated user ID is required",
      401,
    );
  }

  const { name, type } = payload;

  if (!name?.trim()) {
    throw new CategoryServiceError(
      "Category name is required",
    );
  }

  if (!type || !validTypes.includes(type)) {
    throw new CategoryServiceError(
      "Category type must be income or expense",
    );
  }

  const normalizedName = name.trim();

  const duplicate = await Category.findOne({
    userId,
    type,
    name: normalizedName,
  });

  if (duplicate) {
    throw new CategoryServiceError(
      "A category with this name and type already exists",
      409,
    );
  }

  
  if (payload.parentCategory) {
    if (!isValidId(payload.parentCategory)) {
      throw new CategoryServiceError(
        "Invalid parent category ID",
      );
    }

    const parent = await Category.findOne({
      _id: payload.parentCategory,
      userId,
      type,
      isActive: true,
    });

    if (!parent) {
      throw new CategoryServiceError(
        "Parent category not found or has a different type",
        404,
      );
    }
  }

  const category = await Category.create({
    userId,
    name: normalizedName,
    type,
    description: payload.description ?? "",
    icon: payload.icon ?? "tag",
    color: payload.color ?? "#64748b",
    parentCategory: payload.parentCategory || null,
    
    isDefault: false,
    isActive: true,
    sortOrder: payload.sortOrder ?? 0,
  });

  return category;
};





export const updateCategoryService = async (
  userId: string,
  categoryId: string,
  payload: CategoryPayload,
) => {
  if (!isValidId(userId)) {
    throw new CategoryServiceError(
      "Valid authenticated user ID is required",
      401,
    );
  }

  if (!isValidId(categoryId)) {
    throw new CategoryServiceError("Invalid category ID");
  }

  const category = await Category.findOne({
    _id: categoryId,
    userId,
  });

  if (!category) {
    throw new CategoryServiceError(
      "Category not found",
      404,
    );
  }

  if (category.isDefault) {
    throw new CategoryServiceError(
      "Default categories cannot be modified",
      403,
    );
  }

  const nextName = payload.name?.trim() ?? category.name;
  const nextType = payload.type ?? category.type;

  if (!nextName) {
    throw new CategoryServiceError(
      "Category name cannot be empty",
    );
  }

  if (!validTypes.includes(nextType)) {
    throw new CategoryServiceError("Invalid category type");
  }

  const duplicate = await Category.findOne({
    userId,
    name: nextName,
    type: nextType,
    _id: { $ne: categoryId },
  });

  if (duplicate) {
    throw new CategoryServiceError(
      "A category with this name and type already exists",
      409,
    );
  }

  
  if (nextType !== category.type) {
    const hasTransactions = await Transaction.exists({
      userId,
      category: categoryId,
    });

    if (hasTransactions) {
      throw new CategoryServiceError(
        "Cannot change category type while transactions use it",
        409,
      );
    }
  }

  if (payload.parentCategory !== undefined) {
    if (payload.parentCategory === categoryId) {
      throw new CategoryServiceError(
        "A category cannot be its own parent",
      );
    }

    if (payload.parentCategory === null) {
      category.parentCategory = null;
    } else {
      if (!isValidId(payload.parentCategory)) {
        throw new CategoryServiceError(
          "Invalid parent category ID",
        );
      }

      const parent = await Category.findOne({
        userId,
        type: nextType,
        isActive: true,
        _id: payload.parentCategory,
      });

      if (!parent) {
        throw new CategoryServiceError(
          "Parent category not found or has a different type",
          404,
        );
      }

      category.parentCategory = parent._id;
    }
  }

  category.name = nextName;
  category.type = nextType;

  if (payload.description !== undefined) {
    category.description = payload.description;
  }

  if (payload.icon !== undefined) {
    category.icon = payload.icon;
  }

  if (payload.color !== undefined) {
    category.color = payload.color;
  }

  if (payload.sortOrder !== undefined) {
    category.sortOrder = payload.sortOrder;
  }

  
  
  if (payload.isActive !== undefined) {
    if (typeof payload.isActive !== "boolean") {
      throw new CategoryServiceError(
        "isActive must be a boolean",
      );
    }

    category.isActive = payload.isActive;
  }

  await category.save();

  return category;
};





export const deleteCategoryService = async (
  userId: string,
  categoryId: string,
) => {
  if (!isValidId(userId)) {
    throw new CategoryServiceError(
      "Valid authenticated user ID is required",
      401,
    );
  }

  if (!isValidId(categoryId)) {
    throw new CategoryServiceError("Invalid category ID");
  }

  const category = await Category.findOne({
    _id: categoryId,
    userId,
  });

  if (!category) {
    throw new CategoryServiceError(
      "Category not found",
      404,
    );
  }

  if (category.isDefault) {
    throw new CategoryServiceError(
      "Default categories cannot be deleted",
      403,
    );
  }

  const [hasTransactions, hasChildren] = await Promise.all([
    Transaction.exists({
      userId,
      category: categoryId,
    }),

    Category.exists({
      userId,
      parentCategory: categoryId,
    }),
  ]);

  if (hasTransactions) {
    throw new CategoryServiceError(
      "This category has transactions. Deactivate it instead.",
      409,
    );
  }

  if (hasChildren) {
    throw new CategoryServiceError(
      "This category has subcategories. Remove or reassign them first.",
      409,
    );
  }

  await Category.deleteOne({
    _id: categoryId,
    userId,
  });

  return {
    id: categoryId,
    name: category.name,
  };
};