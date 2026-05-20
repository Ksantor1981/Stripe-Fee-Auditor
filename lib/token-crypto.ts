import crypto from "crypto";

function getTokenEncryptionKey(): Buffer {
  const secret =
    process.env.CHECKOUT_TOKEN_ENCRYPTION_KEY?.trim() ||
    process.env.REPORT_TOKEN_SALT?.trim();

  if (!secret || secret.length < 32) {
    throw new Error(
      "CHECKOUT_TOKEN_ENCRYPTION_KEY or REPORT_TOKEN_SALT must be set to at least 32 characters for checkout token encryption"
    );
  }

  return crypto.createHash("sha256").update(secret, "utf8").digest();
}

/** AES-256-GCM sealed payload (v1:iv:tag:ciphertext, base64url). */
export function encryptSecretPayload(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getTokenEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptSecretPayload(payload: string): string {
  const [version, ivRaw, tagRaw, encryptedRaw] = payload.split(":");
  if (version !== "v1" || !ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error("Invalid encrypted payload");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getTokenEncryptionKey(),
    Buffer.from(ivRaw, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
