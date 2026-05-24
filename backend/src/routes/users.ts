import { Router } from "express";

import db from "../db/index.js";

import {
  users,
  projects,
  userProjectStatus,
  oauthAccounts,
} from "../db/schema.js";

import { and, eq, ilike, or } from "drizzle-orm";

import { requireAuth } from "../middleware/auth.js";

const router = Router();

/* =========================
   GET USERS
========================= */

router.get("/", requireAuth, async (req, res) => {
  try {
    const search = req.query.search as string;

    const projectId = req.query.projectId as string;

    let query = db
      .select({
        id: users.id,

        name: users.name,

        email: users.email,

        avatar: users.avatar,

        provider: oauthAccounts.provider,

        projectId: projects.id,

        projectName: projects.name,

        blocked: userProjectStatus.blocked,
      })

      .from(userProjectStatus)

      .innerJoin(users, eq(userProjectStatus.userId, users.id))

      .innerJoin(projects, eq(userProjectStatus.projectId, projects.id))

      .leftJoin(oauthAccounts, eq(oauthAccounts.userId, users.id));
    const conditions = [];

    // ONLY OWN PROJECTS

    conditions.push(eq(projects.developerId, req.developerId!));

    // FILTER PROJECT

    if (projectId) {
      conditions.push(eq(projects.id, projectId));
    }

    // SEARCH

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),

          ilike(users.email, `%${search}%`),
        )!,
      );
    }

    const result = await query.where(and(...conditions));

    return res.json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).send("Failed to fetch users");
  }
});

/* =========================
   BLOCK / UNBLOCK USER
========================= */

router.patch("/:userId/projects/:projectId", requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId as string;

    const projectId = req.params.projectId as string;

    const { blocked } = req.body;

    // verify ownership

    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),

        eq(projects.developerId, req.developerId!),
      ),
    });

    if (!project) {
      return res.status(404).send("Project not found");
    }

    // update user status

    await db
      .update(userProjectStatus)
      .set({
        blocked,
      })
      .where(
        and(
          eq(userProjectStatus.userId, userId),

          eq(userProjectStatus.projectId, projectId),
        ),
      );

    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send("Failed to update user");
  }
});

export default router;
