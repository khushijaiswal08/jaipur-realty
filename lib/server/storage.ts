import "server-only";

import { createHash, createHmac, randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStorageConfig, type StorageConfig } from "@/lib/config/server";

// Upload storage drivers (SPEC §36). "local" writes to ./storage/uploads and is served by
// app/media/[...path]/route.ts (Next.js doesn't serve files added to /public after build).
// "s3" PUTs to any S3-compatible bucket using a minimal AWS Signature V4 (no SDK needed).

export interface StoredFile {
  url: string;
  key: string;
}

const LOCAL_URL_PREFIX = "/media/";

function randomKey(ext: string): string {
  const now = new Date();
  const month = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${month}/${randomBytes(12).toString("hex")}.${ext}`;
}

export function localRoot(): string {
  return path.resolve(process.cwd(), "storage", "uploads");
}

/** Resolves a stored key to an absolute path, refusing anything outside the upload root. */
export function resolveLocalPath(key: string): string | null {
  if (!/^[\w\-/.]+$/.test(key) || key.includes("..")) return null;
  const root = localRoot();
  const full = path.resolve(root, key);
  return full.startsWith(root + path.sep) ? full : null;
}

// ── S3 (SigV4) ────────────────────────────────────────────────────────────────

type S3 = Extract<StorageConfig, { driver: "s3" }>;

const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
const hmac = (key: Buffer | string, data: string) => createHmac("sha256", key).update(data).digest();

function s3Endpoint(cfg: S3): URL {
  return new URL(cfg.endpoint ?? `https://s3.${cfg.region}.amazonaws.com`);
}

async function s3Request(cfg: S3, method: "PUT" | "DELETE", key: string, body?: Buffer, contentType?: string): Promise<void> {
  const endpoint = s3Endpoint(cfg);
  // Path-style addressing works for AWS, R2, Spaces and MinIO.
  const canonicalUri = `/${encodeURIComponent(cfg.bucket)}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256(body ?? "");
  const headers: Record<string, string> = {
    host: endpoint.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    ...(contentType ? { "content-type": contentType } : {}),
  };
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((h) => `${h}:${headers[h]}\n`)
    .join("");
  const canonicalRequest = [method, canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const scope = `${dateStamp}/${cfg.region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
  const kSigning = hmac(hmac(hmac(hmac(`AWS4${cfg.secretAccessKey}`, dateStamp), cfg.region), "s3"), "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(new URL(canonicalUri, endpoint), {
    method,
    headers: { ...headers, authorization, ...(body ? { "cache-control": "public, max-age=31536000, immutable" } : {}) },
    body: body ? new Uint8Array(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok && !(method === "DELETE" && res.status === 404)) {
    throw new Error(`S3 ${method} failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function saveFile(body: Buffer, ext: string, contentType: string): Promise<StoredFile> {
  const cfg = getStorageConfig();
  const key = randomKey(ext);
  if (cfg.driver === "s3") {
    await s3Request(cfg, "PUT", key, body, contentType);
    return { key, url: `${cfg.publicUrl}/${key}` };
  }
  const full = resolveLocalPath(key)!;
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, body);
  return { key, url: `${LOCAL_URL_PREFIX}${key}` };
}

/** Deletes a previously stored upload by its public URL. Seeded placeholders are ignored. */
export async function deleteFileByUrl(url: string): Promise<void> {
  const cfg = getStorageConfig();
  try {
    if (url.startsWith(LOCAL_URL_PREFIX)) {
      const full = resolveLocalPath(url.slice(LOCAL_URL_PREFIX.length));
      if (full) await unlink(full);
    } else if (cfg.driver === "s3" && url.startsWith(`${cfg.publicUrl}/`)) {
      await s3Request(cfg, "DELETE", url.slice(cfg.publicUrl.length + 1));
    }
  } catch (error) {
    console.warn("[storage] delete failed", { url, error: error instanceof Error ? error.message : error });
  }
}

export async function readLocalFile(key: string): Promise<Buffer | null> {
  const full = resolveLocalPath(key);
  if (!full) return null;
  try {
    return await readFile(full);
  } catch {
    return null;
  }
}
