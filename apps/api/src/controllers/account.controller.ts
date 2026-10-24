import type { Request, Response, NextFunction } from "express";
import { addAccountService, deleteAccountService, getAccountsServices, updateAccountService } from "../services/accounts.service.js";



interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    _id?: string;
  };
}

const getUserId = (req: AuthenticatedRequest): string => {
  const userId = req.user?.id ?? req.user?._id;

  if (!userId) {
    throw Object.assign(
      new Error("Authentication required"),
      { statusCode: 401 },
    );
  }

  return userId;
};

const sendError = (
  error: unknown,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof Error) {
    const statusCode = (
      error as Error & { statusCode?: number }
    ).statusCode;

    if (statusCode) {
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    
    if (
      (error as Error & { code?: number }).code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "An account with this name already exists",
      });
      return;
    }
  }

  next(error);
};


export const getAccountsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserId(req);

    const accounts = await getAccountsServices(userId, {
      type: req.query.type as never,
      isActive: req.query.isActive as string | undefined,
    });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    sendError(error, res, next);
  }
};


export const addAccountController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserId(req);

    const account = await addAccountService(
      userId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: account,
    });
  } catch (error) {
    sendError(error, res, next);
  }
};


export const updateAccountController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const account = await updateAccountService(
      userId,
      id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: account,
    });
  } catch (error) {
    sendError(error, res, next);
  }
};


export const deleteAccountController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const account = await deleteAccountService(
      userId,
      id as string,
    );

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: account,
    });
  } catch (error) {
    sendError(error, res, next);
  }
};