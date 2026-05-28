import { Router } from "express";
import { github, google } from "../lib/oauth.js";
import { generateCodeVerifier, generateState } from "arctic";

import crypto from "crypto";

import db from "../db/index.js";

import { developers } from "../db/schema.js";

import { and, eq } from "drizzle-orm";

import { createAccessToken } from "../lib/jwt.js";

const router = Router();

// GET /auth/github
router.get("/github", async (req, res) => {
  try {
    const state = crypto.randomUUID();

    const url = github.createAuthorizationURL(state, ["user:email"]);

    res.cookie("github_oauth_state", state, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10,
    });

    res.redirect(url.toString());
  } catch (error) {
    console.log(error);

    res.status(500).send("OAuth failed");
  }
});

// GET /auth/github/callback
router.get("/github/callback", async (req, res) => {
  try {
    const code = req.query.code?.toString();

    const state = req.query.state?.toString();

    const storedState = req.cookies.github_oauth_state;

    if (!code || !state || !storedState) {
      return res.status(400).send("Missing code/state");
    }

    if (state !== storedState) {
      return res.status(400).send("Invalid state");
    }

    res.clearCookie("github_oauth_state");

    const tokens = await github.validateAuthorizationCode(code);

    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });

    if (!githubUserResponse.ok) {
      return res.status(400).send("Failed to fetch GitHub user");
    }

    const githubUser = await githubUserResponse.json();

    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });

    const emails = await emailResponse.json();

    const primaryEmail = emails.find((email: any) => email.primary)?.email;

    let developer = await db.query.developers.findFirst({
      where: and(
        eq(developers.provider, "github"),

        eq(developers.providerUserId, githubUser.id.toString()),
      ),
    });

    if (!developer) {
      const newDevelopers = await db
        .insert(developers)
        .values({
          email: primaryEmail,

          name: githubUser.name,

          avatar: githubUser.avatar_url,

          provider: "github",

          providerUserId: githubUser.id.toString(),
        })
        .returning();

      developer = newDevelopers[0];
    }

    const token = await createAccessToken({
      userId: developer.id,
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.log(error);

    res.status(500).send("GitHub OAuth failed");
  }
});

// GET /auth/google
router.get("/google", async (req, res) => {
  try {
    const state = generateState();

    const codeVerifier = generateCodeVerifier();

    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "email",
      "profile",
    ]);

    res.cookie("google_oauth_state", state, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10,
    });

    res.cookie("google_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 10,
    });

    res.redirect(url.toString());
  } catch (error) {
    console.log(error);

    res.status(500).send("OAuth failed");
  }
});

// GET /auth/google/callback
router.get("/google/callback", async (req, res) => {
  try {
    const code = req.query.code?.toString();

    const state = req.query.state?.toString();

    const storedState = req.cookies.google_oauth_state;

    const storedCodeVerifier = req.cookies.google_code_verifier;

    if (!code || !state || !storedState || !storedCodeVerifier) {
      return res.status(400).send("Missing params");
    }

    if (state !== storedState) {
      return res.status(400).send("Invalid state");
    }

    res.clearCookie("google_oauth_state");

    res.clearCookie("google_code_verifier");

    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    const googleUserResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      },
    );

    if (!googleUserResponse.ok) {
      return res.status(400).send("Failed to fetch Google user");
    }

    const googleUser = await googleUserResponse.json();

    let developer = await db.query.developers.findFirst({
      where: and(
        eq(developers.provider, "google"),

        eq(developers.providerUserId, googleUser.id),
      ),
    });

    if (!developer) {
      const newDevelopers = await db
        .insert(developers)
        .values({
          email: googleUser.email,

          name: googleUser.name,

          avatar: googleUser.picture,

          provider: "google",

          providerUserId: googleUser.id,
        })
        .returning();

      developer = newDevelopers[0];
    }

    const token = await createAccessToken({
      userId: developer.id,
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.log(error);

    res.status(500).send("Google OAuth failed");
  }
});

export default router;
