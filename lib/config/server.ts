import "server-only";

// Server-only settings (SPEC §34.2, §57.3). Never NEXT_PUBLIC_, never imported by client code.

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const isProduction = process.env.NODE_ENV === "production";

let authSecretKey: Uint8Array | undefined;

/** HMAC key for signing session tokens and CSRF-free form tokens. */
export function getAuthSecret(): Uint8Array {
  if (authSecretKey) return authSecretKey;
  const secret = clean(process.env.AUTH_SECRET);
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET is missing or shorter than 32 characters. See .env.example.");
  }
  authSecretKey = new TextEncoder().encode(secret);
  return authSecretKey;
}

/** Salt for hashing visitor IPs (SPEC §48). Falls back to AUTH_SECRET so hashes are never unsalted. */
export function getIpHashSalt(): string {
  const salt = clean(process.env.IP_HASH_SALT) ?? clean(process.env.AUTH_SECRET);
  if (!salt) throw new Error("IP_HASH_SALT (or AUTH_SECRET) must be set.");
  return salt;
}

export interface SmtpConfig {
  host: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
}

/** Null when email isn't configured — notifications then go to the server log (SPEC §29). */
export function getSmtpConfig(): SmtpConfig | null {
  const host = clean(process.env.SMTP_HOST);
  const from = clean(process.env.SMTP_FROM);
  if (!host || !from) return null;
  return {
    host,
    port: Number(clean(process.env.SMTP_PORT) ?? 587),
    user: clean(process.env.SMTP_USER),
    password: clean(process.env.SMTP_PASSWORD),
    from,
  };
}

export function getLeadNotificationRecipients(): string[] {
  return (clean(process.env.LEAD_NOTIFICATION_EMAIL) ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function getTurnstileSecret(): string | undefined {
  return clean(process.env.TURNSTILE_SECRET_KEY);
}

export type StorageConfig =
  | { driver: "local"; directory: string }
  | {
      driver: "s3";
      endpoint?: string;
      region: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
      publicUrl: string;
    };

export function getStorageConfig(): StorageConfig {
  if (clean(process.env.STORAGE_DRIVER) === "s3") {
    const region = clean(process.env.S3_REGION);
    const bucket = clean(process.env.S3_BUCKET);
    const accessKeyId = clean(process.env.S3_ACCESS_KEY_ID);
    const secretAccessKey = clean(process.env.S3_SECRET_ACCESS_KEY);
    const publicUrl = clean(process.env.S3_PUBLIC_URL);
    if (!region || !bucket || !accessKeyId || !secretAccessKey || !publicUrl) {
      throw new Error("STORAGE_DRIVER=s3 requires S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL.");
    }
    return {
      driver: "s3",
      endpoint: clean(process.env.S3_ENDPOINT),
      region,
      bucket,
      accessKeyId,
      secretAccessKey,
      publicUrl: publicUrl.replace(/\/+$/, ""),
    };
  }
  return { driver: "local", directory: "storage/uploads" };
}
