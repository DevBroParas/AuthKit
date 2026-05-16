import { Router } from "express";

import db from "../db/index.js";

import { projects, users, sessions, projectProviders , authorizedDomains} from "../db/schema.js";

import { requireAuth } from "../middleware/auth.js";

import { generatePublishableKey, generateSecretKey } from "../lib/keys.js";

import { and, eq } from "drizzle-orm";

const router = Router();

/* =========================
   CREATE PROJECT
========================= */

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send("Project name required");
    }

    const newProjects = await db
      .insert(projects)
      .values({
        name,

        developerId: req.developerId!,

        publishableKey: generatePublishableKey(),

        secretKey: generateSecretKey(),
      })
      .returning();

    return res.json(newProjects[0]);
  } catch (error) {
    console.log(error);

    return res.status(500).send("Failed to create project");
  }
});

/* =========================
   GET ALL PROJECTS
========================= */

router.get("/", requireAuth, async (req, res) => {
  try {
    const developerProjects = await db.query.projects.findMany({
      where: eq(projects.developerId, req.developerId!),
    });

    return res.json(developerProjects);
  } catch (error) {
    console.log(error);

    return res.status(500).send("Failed to fetch projects");
  }
});

/* =========================
   GET SINGLE PROJECT
========================= */

router.get("/:projectId", requireAuth, async (req, res) => {
  try {
    const projectId = req.params.projectId as string;

    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),

        eq(projects.developerId, req.developerId!),
      ),
    });

    if (!project) {
      return res.status(404).send("Project not found");
    }

    return res.json(project);
  } catch (error) {
    console.log(error);

    return res.status(500).send("Failed to fetch project");
  }
});

/* =========================
   UPDATE PROJECT
========================= */

router.patch("/:projectId", requireAuth, async (req, res) => {
  try {
    const projectId = req.params.projectId as string;

    const { name } = req.body;

    if (!name) {
      return res.status(400).send("Project name required");
    }

    // check ownership
    const existingProject = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),

        eq(projects.developerId, req.developerId!),
      ),
    });

    if (!existingProject) {
      return res.status(404).send("Project not found");
    }

    // update
    const updatedProjects = await db
      .update(projects)
      .set({
        name,
      })
      .where(eq(projects.id, projectId))
      .returning();

    return res.json(updatedProjects[0]);
  } catch (error) {
    console.log(error);

    return res.status(500).send("Failed to update project");
  }
});

/* =========================
   PROJECT OVERVIEW
========================= */

router.get(
  "/:projectId/overview",
  requireAuth,
  async (req, res) => {

    try {

      const projectId =
        req.params.projectId as string;

      // check ownership
      const project =
        await db.query.projects.findFirst({
          where: and(
            eq(
              projects.id,
              projectId
            ),

            eq(
              projects.developerId,
              req.developerId!
            )
          ),
        });

      if (!project) {
        return res
          .status(404)
          .send("Project not found");
      }

      // total users
      const totalUsers =
        await db.query.users.findMany({
          where: eq(
            users.projectId,
            projectId
          ),
        });

      // sessions
      const activeSessions =
        await db.query.sessions.findMany({
          where: eq(
            sessions.projectId,
            projectId
          ),
        });

      // providers
      const providers =
        await db.query.projectProviders.findMany({
          where: eq(
            projectProviders.projectId,
            projectId
          ),
        });

      // recent users
      const recentUsers =
        await db.query.users.findMany({
          where: eq(
            users.projectId,
            projectId
          ),

          limit: 5,

          orderBy: (
            users,
            { desc }
          ) => [
            desc(users.createdAt)
          ],
        });

      return res.json({
        project,

        stats: {
          totalUsers:
            totalUsers.length,

          activeSessions:
            activeSessions.length,

          providersEnabled:
            providers.filter(
              (p) => p.enabled
            ).length,
        },

        recentUsers,
      });

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .send(
          "Failed to fetch overview"
        );
    }
  }
);

/* =========================
   GET PROJECT PROVIDERS
========================= */

router.get(
  "/:projectId/providers",
  requireAuth,
  async (req, res) => {

    try {

      const projectId =
        req.params.projectId as string;

      // verify ownership
      const project =
        await db.query.projects.findFirst({
          where: and(
            eq(
              projects.id,
              projectId
            ),

            eq(
              projects.developerId,
              req.developerId!
            )
          ),
        });

      if (!project) {
        return res
          .status(404)
          .send("Project not found");
      }

      const providers =
        await db.query.projectProviders.findMany({
          where: eq(
            projectProviders.projectId,
            projectId
          ),
        });

      return res.json(
        providers
      );

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .send(
          "Failed to fetch providers"
        );
    }
  }
);

/* =========================
   TOGGLE PROVIDER
========================= */

router.patch(
  "/:projectId/providers/:provider",
  requireAuth,
  async (req, res) => {

    try {

      const projectId =
        req.params.projectId as string;

      const provider =
        req.params.provider as string;

      const {
        enabled,
      } = req.body;

      // verify ownership
      const project =
        await db.query.projects.findFirst({
          where: and(
            eq(
              projects.id,
              projectId
            ),

            eq(
              projects.developerId,
              req.developerId!
            )
          ),
        });

      if (!project) {
        return res
          .status(404)
          .send("Project not found");
      }

      const existingProvider =
        await db.query.projectProviders.findFirst({
          where: and(
            eq(
              projectProviders.projectId,
              projectId
            ),

            eq(
              projectProviders.provider,
              provider
            )
          ),
        });

      // create provider if doesn't exist
      if (!existingProvider) {

        const newProvider =
          await db
            .insert(projectProviders)
            .values({
              projectId,

              provider,

              enabled,
            })
            .returning();

        return res.json(
          newProvider[0]
        );
      }

      // update provider
      const updatedProvider =
        await db
          .update(projectProviders)
          .set({
            enabled,
          })
          .where(
            eq(
              projectProviders.id,
              existingProvider.id
            )
          )
          .returning();

      return res.json(
        updatedProvider[0]
      );

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .send(
          "Failed to update provider"
        );
    }
  }
);

/* =========================
   GET AUTHORIZED DOMAINS
========================= */

router.get(
  "/:projectId/domains",
  requireAuth,
  async (req, res) => {

    try {

      const projectId =
        req.params.projectId as string;

      // verify ownership
      const project =
        await db.query.projects.findFirst({
          where: and(
            eq(
              projects.id,
              projectId
            ),

            eq(
              projects.developerId,
              req.developerId!
            )
          ),
        });

      if (!project) {
        return res
          .status(404)
          .send("Project not found");
      }

      const domains =
        await db.query.authorizedDomains.findMany({
          where: eq(
            authorizedDomains.projectId,
            projectId
          ),
        });

      return res.json(
        domains
      );

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .send(
          "Failed to fetch domains"
        );
    }
  }
);

/* =========================
   ADD DOMAIN
========================= */

router.post(
  "/:projectId/domains",
  requireAuth,
  async (req, res) => {

    try {

      const projectId =
        req.params.projectId as string;

      const {
        domain,
      } = req.body;

      if (!domain) {
        return res
          .status(400)
          .send("Domain required");
      }

      // verify ownership
      const project =
        await db.query.projects.findFirst({
          where: and(
            eq(
              projects.id,
              projectId
            ),

            eq(
              projects.developerId,
              req.developerId!
            )
          ),
        });

      if (!project) {
        return res
          .status(404)
          .send("Project not found");
      }

      const existingDomain =
        await db.query.authorizedDomains.findFirst({
          where: and(
            eq(
              authorizedDomains.projectId,
              projectId
            ),

            eq(
              authorizedDomains.domain,
              domain
            )
          ),
        });

      if (existingDomain) {
        return res
          .status(400)
          .send(
            "Domain already exists"
          );
      }

      const newDomain =
        await db
          .insert(
            authorizedDomains
          )
          .values({
            projectId,

            domain,
          })
          .returning();

      return res.json(
        newDomain[0]
      );

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .send(
          "Failed to add domain"
        );
    }
  }
);

/* =========================
   DELETE DOMAIN
========================= */

router.delete(
  "/:projectId/domains/:domainId",
  requireAuth,
  async (req, res) => {

    try {

      const projectId =
        req.params.projectId as string;

      const domainId =
        req.params.domainId as string;

      // verify ownership
      const project =
        await db.query.projects.findFirst({
          where: and(
            eq(
              projects.id,
              projectId
            ),

            eq(
              projects.developerId,
              req.developerId!
            )
          ),
        });

      if (!project) {
        return res
          .status(404)
          .send("Project not found");
      }

      await db
        .delete(
          authorizedDomains
        )
        .where(
          eq(
            authorizedDomains.id,
            domainId
          )
        );

      return res.json({
        success: true,
      });

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .send(
          "Failed to delete domain"
        );
    }
  }
);

/* =========================
   DELETE PROJECT
========================= */

router.delete("/:projectId", requireAuth, async (req, res) => {
  try {
    const projectId = req.params.projectId as string;

    // check ownership
    const existingProject = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),

        eq(projects.developerId, req.developerId!),
      ),
    });

    if (!existingProject) {
      return res.status(404).send("Project not found");
    }

    await db.delete(projects).where(eq(projects.id, projectId));

    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send("Failed to delete project");
  }
});

export default router;
