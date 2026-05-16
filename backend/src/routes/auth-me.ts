import { Router } from "express";

import db from "../db/index.js";

import { developers } from "../db/schema.js";

import { eq } from "drizzle-orm";

import { verifyAccessToken } from "../lib/jwt.js";

const router = Router();

router.get("/", async (req, res) => {
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

    const developer =
      await db.query.developers.findFirst({
        where: eq(
          developers.id,
          payload.userId as string
        ),
      });

    if (!developer) {
      return res
        .status(404)
        .send("Developer not found");
    }

    return res.json(developer);

  } catch (error) {
    console.log(error);

    return res
      .status(401)
      .send("Invalid token");
  }
});

export default router;