import type { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../lib/jwt.js";

declare global {
  namespace Express {
    interface Request {
      developerId?: string;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const token =
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .send("Unauthorized");
    }

    const payload =
      await verifyAccessToken(token);

    req.developerId =
      payload.userId as string;

    next();

  } catch (error) {

    return res
      .status(401)
      .send("Invalid token");

  }
}