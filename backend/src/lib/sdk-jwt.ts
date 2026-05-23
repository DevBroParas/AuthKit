import {
  SignJWT,
  jwtVerify,
} from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET!
);

/* =========================
   CREATE ACCESS TOKEN
========================= */

export async function createSdkAccessToken(
  payload: {
    userId: string;
    projectId: string;
  }
) {

  return await new SignJWT(payload)

    .setProtectedHeader({
      alg: "HS256",
    })

    .setIssuedAt()

    .setExpirationTime("15m")

    .sign(secret);
}

/* =========================
   VERIFY ACCESS TOKEN
========================= */

export async function verifySdkAccessToken(
  token: string
) {

  const { payload } =
    await jwtVerify(
      token,
      secret
    );

  return payload as {
    userId: string;
    projectId: string;
  };
}
