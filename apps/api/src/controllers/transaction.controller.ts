import type { Request, Response, NextFunction } from "express";

import {
  addTransactionService,
  getTransactionService,
  updateTransactionService,
  deleteTransactionService,
} from "../services/transaction.service.js";



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


const handleError = (
  error: unknown,
  res: Response,
  next: NextFunction,
): void => {
  if (error instanceof Error) {
    const statusCode =
      (error as Error & { statusCode?: number }).statusCode;

    if (statusCode === 401) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }
  }

  next(error);
};






export const addTransactionController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserId(req);

    const transaction = await addTransactionService(
      userId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    handleError(error, res, next);
  }
};






export const getTransactionController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserId(req);

    const filters = {
      type: req.query.type as string | undefined,
      status: req.query.status as string | undefined,
      account: req.query.account as string | undefined,
      category: req.query.category as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
    };

    const result = await getTransactionService(
      userId,
      filters,
    );

    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      ...result,
    });
  } catch (error) {
    handleError(error, res, next);
  }
};






export const updateTransactionController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = req.params.id;
    if (typeof id !== "string") {
      res.status(400).json({ success: false, message: "Transaction ID is required" });
      return;
    }

    const transaction = await updateTransactionService(
      userId,
      id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    handleError(error, res, next);
  }
};






export const deleteTransactionController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = req.params.id;
    if (typeof id !== "string") {
      res.status(400).json({ success: false, message: "Transaction ID is required" });
      return;
    }

    const transaction = await deleteTransactionService(
      userId,
      id,
    );

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: transaction,
    });
  } catch (error) {
    handleError(error, res, next);
  }
};