import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Password della redazione: scrypt con sale casuale, formato
 * `scrypt$<sale>$<impronta>` (entrambi in base64url). Lo stesso formato è
 * usato da `scripts/crea-utente.mjs`.
 */
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1 }, (error, key) => (error ? reject(error) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64url");
  const actual = await derive(password, Buffer.from(saltB64, "base64url"));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Impronta fittizia: serve a confrontare comunque una password quando l'email non esiste. */
export const DUMMY_HASH = `scrypt$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(KEY_LENGTH).toString("base64url")}`;
