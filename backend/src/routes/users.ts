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

// GET /users
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


    conditions.push(eq(projects.developerId, req.developerId!));


    if (projectId) {
      conditions.push(eq(projects.id, projectId));
    }


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

// PATCH /users/:userId/projects/:projectId
router.patch("/:userId/projects/:projectId", requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId as string;

    const projectId = req.params.projectId as string;

    const { blocked } = req.body;


    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),

        eq(projects.developerId, req.developerId!),
      ),
    });

    if (!project) {
      return res.status(404).send("Project not found");
    }


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
