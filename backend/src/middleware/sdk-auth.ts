import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  verifySdkAccessToken,
} from "../lib/sdk-jwt.js";

export async function requireSdkAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const token =
      req.cookies.sdk_access_token;

    if (!token) {
      return res
        .status(401)
        .send("Unauthorized");
    }

    const payload =
      await verifySdkAccessToken(
        token
      );

    req.userId =
      payload.userId;

    req.projectId =
      payload.projectId;

    next();

  } catch {

    return res
      .status(401)
      .send("Unauthorized");
  }
}