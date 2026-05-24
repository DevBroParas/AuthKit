import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const developers = pgTable("developers", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: text("email").notNull(),

  name: text("name"),

  avatar: text("avatar"),

  provider: text("provider"),

  providerUserId: text("provider_user_id"),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  developerId: uuid("developer_id").notNull(),

  name: text("name").notNull(),

  publishableKey: text("publishable_key").notNull().unique(),

  secretKey: text("secret_key").notNull().unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: uuid("project_id").notNull(),

  email: text("email").notNull(),

  name: text("name"),

  avatar: text("avatar"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const oauthAccounts = pgTable("oauth_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull(),

  provider: text("provider").notNull(),

  providerUserId: text("provider_user_id").notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull(),

  projectId: uuid("project_id").notNull(),

  refreshToken: text("refresh_token").notNull(),

  userAgent: text("user_agent"),

  ip: text("ip"),

  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectProviders = pgTable("project_providers", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: uuid("project_id").notNull(),

  provider: text("provider").notNull(),

  enabled: boolean("enabled").default(true).notNull(),
});

export const authorizedDomains = pgTable("authorized_domains", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: uuid("project_id").notNull(),

  domain: text("domain").notNull(),
});

export const userProjectStatus =
  pgTable(
    "user_project_status",
    {

      id: uuid("id")
        .defaultRandom()
        .primaryKey(),

      userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),

      projectId: uuid("project_id")
        .references(() => projects.id)
        .notNull(),

      blocked:
        boolean("blocked")
          .default(false)
          .notNull(),

      createdAt:
        timestamp("created_at")
          .defaultNow()
          .notNull(),
    }
  );