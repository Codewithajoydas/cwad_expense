import type { Request, Response, NextFunction } from "express";
import {
  addCategoryService,
  deleteCategoryService,
  getCategoriesService,
  updateCategoryService,
} from "../services/category.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    _id?: string;
  };
}

const getUserId = (req: AuthenticatedRequest): string => {
  const userId = req.user?.id ?? req.user?._id;

  if (!userId) {
    throw Object.assign(new Error("Authentication required"), {
      statusCode: 401,
    });
  }

  return userId;
};

const handleError = (error: unknown, res: Response, next: NextFunction): void => {
  if (error instanceof Error) {
    const statusCode = (error as Error & { statusCode?: number }).statusCode;

    if (statusCode) {
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if ((error as Error & { code?: number }).code === 11000) {
      res.status(409).json({
        success: false,
        message: "This category already exists",
      });
      return;
    }
  }

  next(error);
};

export const getCategoriesController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await getCategoriesService(getUserId(req), {
      type: req.query.type as "income" | "expense" | undefined,
      isActive: req.query.isActive as string | undefined,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    handleError(error, res, next);
  }
};

export const addCategoryController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const category = await addCategoryService(getUserId(req), req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    handleError(error, res, next);
  }
};

export const updateCategoryController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const category = await updateCategoryService(getUserId(req), req.params.id as string, req.body);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    handleError(error, res, next);
  }
};

export const deleteCategoryController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const category = await deleteCategoryService(getUserId(req), req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    handleError(error, res, next);
  }
};
