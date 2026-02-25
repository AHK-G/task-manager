import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

export const authMiddleware = (
  req: Request & { userId?: string },
  _res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    req.userId = decoded.userId;
    next();
  } catch {
    next(new AppError("Unauthorized", 401));
  }
};