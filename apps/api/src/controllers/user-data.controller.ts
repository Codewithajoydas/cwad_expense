import type { NextFunction, Request, Response } from "express";
import { isUserDataResource, UserDataError, createUserData, deleteUserData, listUserData, updateUserData } from "../services/user-data.service.js";

interface AuthenticatedRequest extends Request {
  user?: { id?: string; _id?: string };
}

function getUserId(req: AuthenticatedRequest): string {
  const id = req.user?.id ?? req.user?._id;
  if (!id) throw new UserDataError("Authentication required", 401);
  return id;
}

function sendError(error: unknown, res: Response, next: NextFunction): void {
  if (error instanceof UserDataError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  next(error);
}

function getResource(req: Request, res: Response) {
  const resource = req.params.resource;
  if (typeof resource !== "string" || !isUserDataResource(resource)) {
    res.status(404).json({ success: false, message: "Unknown data resource" });
    return undefined;
  }
  return resource;
}

export async function listUserDataController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resource = getResource(req, res);
    if (!resource) return;
    const data = await listUserData(getUserId(req), resource);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    sendError(error, res, next);
  }
}

export async function createUserDataController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resource = getResource(req, res);
    if (!resource) return;
    const data = await createUserData(getUserId(req), resource, req.body);
    res.status(201).json({ success: true, message: "Record created successfully", data });
  } catch (error) {
    sendError(error, res, next);
  }
}

export async function updateUserDataController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resource = getResource(req, res);
    if (!resource) return;
    const data = await updateUserData(getUserId(req), resource, req.params.id as string, req.body);
    res.status(200).json({ success: true, message: "Record updated successfully", data });
  } catch (error) {
    sendError(error, res, next);
  }
}

export async function deleteUserDataController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resource = getResource(req, res);
    if (!resource) return;
    const data = await deleteUserData(getUserId(req), resource, req.params.id as string);
    res.status(200).json({ success: true, message: "Record deleted successfully", data });
  } catch (error) {
    sendError(error, res, next);
  }
}
