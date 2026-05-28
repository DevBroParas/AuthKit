import type { Response } from "express";

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {

  res.cookie("sdk_access_token", accessToken, {
    httpOnly: true,

    secure: true,

    sameSite: "none",

    maxAge: 1000 * 60 * 15,
  });


  res.cookie("sdk_refresh_token", refreshToken, {
    httpOnly: true,

    secure: true,

    sameSite: "none",

    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("sdk_access_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.clearCookie("sdk_refresh_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
}
