import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error-handler";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    next(new AppError(401, "INVALID_TOKEN", "Invalid or expired token"));
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  if (req.userRole !== "ADMIN" && req.userRole !== "SUPER_ADMIN") {
    return next(new AppError(403, "FORBIDDEN", "Admin access required"));
  }
  next();
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}
