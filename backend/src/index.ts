import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import authMeRoutes from "./routes/auth-me.js";
import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/users.js";
import dashboardRoutes from "./routes/dashboard.js";

import sdkOauthRoutes from "./routes/sdk/oauth.js";

import sdkSessionRoutes from "./routes/sdk/session.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(cookieParser());

app.get("/", (_, res) => {
  res.send("AuthCit API Running");
});

app.use("/auth", authRoutes);

app.use("/me", authMeRoutes);

app.use("/projects", projectRoutes);

app.use("/users", userRoutes);

app.use("/dashboard", dashboardRoutes);

app.use("/sdk/oauth", sdkOauthRoutes);

app.use("/sdk", sdkSessionRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
