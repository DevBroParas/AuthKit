import { Router } from "express";

import {
  requireSdkAuth,
} from "../../middleware/sdk-auth.js";

import db from "../../db/index.js";

import {
  users,
} from "../../db/schema.js";

import {
  eq,
} from "drizzle-orm";

import {
  clearAuthCookies,
} from "../../lib/sdk-cookies.js";

const router = Router();

/* =========================
   CURRENT USER
========================= */

router.get(
  "/me",
  requireSdkAuth,
  async (req, res) => {

    try {
      res.set("Cache-Control", "no-store");

      const user =
        await db.query.users.findFirst({
          where: eq(
            users.id,
            req.userId!
          ),
        });

      return res.json(user);

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .send("Failed");
    }
  }
);

/* =========================
   SIGN OUT
========================= */

router.post(
  "/signout",
  async (_, res) => {

    clearAuthCookies(res);

    return res.json({
      success: true,
    });
  }
);

export default router;
