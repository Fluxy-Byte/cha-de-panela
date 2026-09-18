import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "family_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 dias

function getSecret(): string {
  const secret = process.env.FAMILY_SESSION_SECRET;
  if (!secret) {
    throw new Error("FAMILY_SESSION_SECRET não configurado.");
  }
  return secret;
}

function sign(familyId: string): string {
  return createHmac("sha256", getSecret()).update(familyId).digest("hex");
}

function buildCookieValue(familyId: string): string {
  return `${familyId}.${sign(familyId)}`;
}

function verifyCookieValue(raw: string): string | null {
  const separatorIndex = raw.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const familyId = raw.slice(0, separatorIndex);
  const signature = raw.slice(separatorIndex + 1);
  const expected = sign(familyId);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  return familyId;
}

export async function setFamilySessionCookie(familyId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, buildCookieValue(familyId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearFamilySessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionFamilyId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifyCookieValue(raw);
}
