import { Router } from "express";

import db from "../db/index.js";

import {
  projects,
  users,
  sessions,
  projectProviders,
} from "../db/schema.js";

import {
  eq,
} from "drizzle-orm";

import {
  requireAuth,
} from "../middleware/auth.js";

const router = Router();

// GET /dashboard/overview
router.get(
  "/overview",
  requireAuth,
  async (req, res) => {

    try {


      const developerProjects =
        await db.query.projects.findMany({
          where: eq(
            projects.developerId,
            req.developerId!
          ),
        });

      const projectIds =
        developerProjects.map(
          (p) => p.id
        );


      const allUsers =
        await db.query.users.findMany();

      const filteredUsers =
        allUsers.filter(
          (user) =>
            projectIds.includes(
              user.projectId
            )
        );


      const allSessions =
        await db.query.sessions.findMany();

      const filteredSessions =
        allSessions.filter(
          (session) =>
            projectIds.includes(
              session.projectId
            )
        );


      const allProviders =
        await db.query.projectProviders.findMany();

      const enabledProviders =
        allProviders.filter(
          (provider) =>
            projectIds.includes(
              provider.projectId
            ) &&
            provider.enabled
        );


      const recentUsers =
        filteredUsers
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ).getTime() -
              new Date(
                a.createdAt
              ).getTime()
          )
          .slice(0, 8)
          .map((user) => {

            const project =
              developerProjects.find(
                (p) =>
                  p.id ===
                  user.projectId
              );

            return {
              ...user,
              projectName:
                project?.name,
            };
          });


      const chartData =
        Array.from({
          length: 12,
        }).map((_, index) => {

          const hour =
            `${index * 2}:00`;

          return {
            time: hour,
            users:
              Math.floor(
                Math.random() * 50
              ) + 10,
          };
        });

      return res.json({

        stats: {

          totalProjects:
            developerProjects.length,

          totalUsers:
            filteredUsers.length,

          activeSessions:
            filteredSessions.length,

          enabledProviders:
            enabledProviders.length,
        },

        projects:
          developerProjects,

        recentUsers,

        chartData,
      });

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .send(
          "Failed to fetch dashboard"
        );
    }
  }
);

export default router;
