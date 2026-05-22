import { Router } from "express";

import crypto from "crypto";

import db from "../../db/index.js";

import {
  projects,
  users,
  oauthAccounts,
  sessions,
  projectProviders,
  authorizedDomains,
} from "../../db/schema.js";

import { eq, and } from "drizzle-orm";

import { githubProvider } from "../../provides/github.js";

import { googleProvider } from "../../provides/google.js";

import { createSdkAccessToken } from "../../lib/sdk-jwt.js";

import { setAuthCookies } from "../../lib/sdk-cookies.js";

const router = Router();

/* =========================
   START GITHUB OAUTH
========================= */

router.get("/github/start", async (req, res) => {
  try {
    const publishableKey = req.query.publishableKey?.toString();

    const redirectUrl = req.query.redirectUrl?.toString();

    if (!publishableKey || !redirectUrl) {
      return res.status(400).send("Missing fields");
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.publishableKey, publishableKey),
    });

    if (!project) {
      return res.status(404).send("Project not found");
    }

    const parsedUrl = new URL(redirectUrl);

    const hostname = parsedUrl.origin;

    const domains = await db.query.authorizedDomains.findMany({
      where: eq(authorizedDomains.projectId, project.id),
    });

    console.log("redirect:", hostname);

    console.log(
      "domains:",
      domains.map((d) => d.domain),
    );

    const isAuthorized = domains.some((domain) => domain.domain === hostname);

    if (!isAuthorized) {
      return res.status(403).send("Unauthorized domain");
    }

    const providerConfig = await db.query.projectProviders.findFirst({
      where: and(
        eq(projectProviders.projectId, project.id),

        eq(projectProviders.provider, "github"),
      ),
    });

    if (providerConfig && !providerConfig.enabled) {
      return res.status(403).send("GitHub login disabled");
    }

    const state = crypto.randomUUID();

    const url = githubProvider.createAuthorizationURL(state, ["user:email"]);

    res.cookie("sdk_oauth_state", state, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10,
    });

    res.cookie("sdk_project_id", project.id, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10,
    });

    res.cookie("sdk_redirect_url", redirectUrl, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10,
    });

    return res.redirect(url.toString());
  } catch (error) {
    console.log(error);

    return res.status(500).send("OAuth failed");
  }
});

/* =========================
   GITHUB CALLBACK
========================= */

router.get("/github/callback", async (req, res) => {
  try {
    const code = req.query.code?.toString();

    const state = req.query.state?.toString();

    const storedState = req.cookies.sdk_oauth_state;

    const projectId = req.cookies.sdk_project_id;

    const redirectUrl = req.cookies.sdk_redirect_url;

    if (!code || !state || !storedState || !projectId) {
      return res.status(400).send("Missing params");
    }

    if (state !== storedState) {
      return res.status(400).send("Invalid state");
    }

    const tokens = await githubProvider.validateAuthorizationCode(code);

    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });

    const githubUser = await githubUserResponse.json();

    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });

    const emails = await emailsResponse.json();

    const primaryEmail = emails.find((email: any) => email.primary)?.email;

    let user = await db.query.users.findFirst({
      where: and(
        eq(users.projectId, projectId),

        eq(users.email, primaryEmail),
      ),
    });

    if (!user) {
      const newUsers = await db
        .insert(users)
        .values({
          projectId,
          email: primaryEmail,
          name: githubUser.name,
          avatar: githubUser.avatar_url,
        })
        .returning();

      user = newUsers[0];

      await db.insert(oauthAccounts).values({
        userId: user.id,
        provider: "github",
        providerUserId: githubUser.id.toString(),
      });
    }

    const refreshToken = crypto.randomUUID();

    await db.insert(sessions).values({
      userId: user.id,

      projectId,

      refreshToken,

      userAgent: req.headers["user-agent"],

      ip: req.ip,

      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });

    const accessToken = await createSdkAccessToken({
      userId: user.id,

      projectId,
    });

    setAuthCookies(res, accessToken, refreshToken);

    return res.redirect(redirectUrl);
  } catch (error) {
    console.log(error);

    return res.status(500).send("OAuth failed");
  }
});

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("hex");
}

router.get("/google/start", async (req, res) => {
  try {
    const publishableKey = req.query.publishableKey?.toString();

    const redirectUrl = req.query.redirectUrl?.toString();
    if (!publishableKey || !redirectUrl) {
      return res.status(400).send("Missing params");
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.publishableKey, publishableKey),
    });

    if (!project) {
      return res.status(404).send("Project not found");
    }

    const parsedUrl = new URL(redirectUrl);

    const hostname = parsedUrl.origin;

    const domains = await db.query.authorizedDomains.findMany({
      where: eq(authorizedDomains.projectId, project.id),
    });

    const isAuthorized = domains.some((domain) => domain.domain === hostname);

    if (!isAuthorized) {
      return res.status(403).send("Unauthorized domain");
    }

    const providerConfig = await db.query.projectProviders.findFirst({
      where: and(
        eq(projectProviders.projectId, project.id),

        eq(projectProviders.provider, "google"),
      ),
    });

    if (providerConfig && !providerConfig.enabled) {
      return res.status(403).send("Google login disabled");
    }

    const state = crypto.randomUUID();

    const codeVerifier = generateCodeVerifier();

    const url = googleProvider.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);

    res.cookie("sdk_google_oauth_state", state, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10,
    });

    res.cookie("sdk_google_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10,
    });

    res.cookie("sdk_project_id", project.id, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10,
    });

    res.cookie("sdk_redirect_url", redirectUrl, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10,
    });

    return res.redirect(url.toString());
  } catch (error) {
    console.log(error);

    return res.status(500).send("Google OAuth failed");
  }
});

router.get("/google/callback", async (req, res) => {
  try {
    const code = req.query.code?.toString();

    const state = req.query.state?.toString();

    const storedState = req.cookies.sdk_google_oauth_state;

    const codeVerifier = req.cookies.sdk_google_code_verifier;

    const projectId = req.cookies.sdk_project_id;

    const redirectUrl = req.cookies.sdk_redirect_url;

    if (
      !code ||
      !state ||
      !storedState ||
      !codeVerifier ||
      !projectId ||
      !redirectUrl
    ) {
      return res.status(400).send("Missing params");
    }

    if (state !== storedState) {
      return res.status(400).send("Invalid state");
    }

    const tokens = await googleProvider.validateAuthorizationCode(
      code,
      codeVerifier,
    );

    const googleUserResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      },
    );

    const googleUser = await googleUserResponse.json();

    let user = await db.query.users.findFirst({
      where: and(
        eq(users.projectId, projectId),

        eq(users.email, googleUser.email),
      ),
    });

    if (!user) {
      const newUsers = await db
        .insert(users)
        .values({
          projectId,

          email: googleUser.email,

          name: googleUser.name,

          avatar: googleUser.picture,
        })
        .returning();

      user = newUsers[0];

      await db.insert(oauthAccounts).values({
        userId: user.id,

        provider: "google",

        providerUserId: googleUser.sub,
      });
    }

    const refreshToken = crypto.randomUUID();

    await db.insert(sessions).values({
      userId: user.id,

      projectId,

      refreshToken,

      userAgent: req.headers["user-agent"] || null,

      ip: req.ip || null,

      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });

    const accessToken = await createSdkAccessToken({
      userId: user.id,

      projectId,
    });

    setAuthCookies(res, accessToken, refreshToken);

    return res.redirect(redirectUrl);
  } catch (error) {
    console.log(error);

    return res.status(500).send("Google OAuth failed");
  }
});

export default router;
