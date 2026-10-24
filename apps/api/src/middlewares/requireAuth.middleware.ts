import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.lib.js";


// Extend Express Request with the authenticated Better Auth user.
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
  };

  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData?.user || !sessionData.session) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in to continue.",
      });
      return;
    }

    // Attach verified Better Auth session data to the request.
    const authenticatedReq = req as AuthenticatedRequest;

    authenticatedReq.user = {
      id: sessionData.user.id,
      name: sessionData.user.name,
      email: sessionData.user.email,
      emailVerified: sessionData.user.emailVerified,
      image: sessionData.user.image,
    };

    authenticatedReq.session = {
      id: sessionData.session.id,
      userId: sessionData.session.userId,
      expiresAt: sessionData.session.expiresAt,
    };

    next();
  } catch (error) {
    next(error);
  }
};