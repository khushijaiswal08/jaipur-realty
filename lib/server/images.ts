import "server-only";

import sharp from "sharp";

// Upload processing (SPEC §36): sniff the real format (never trust the file name or MIME),
// honour EXIF orientation, resize to ≤ 2400 px, re-encode as WebP. sharp drops all metadata
// (including GPS) unless explicitly asked to keep it.

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_PDF_BYTES = 15 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

export class UploadError extends Error {}

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
}

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  if (input.byteLength > MAX_IMAGE_BYTES) throw new UploadError("Images must be 8 MB or smaller.");
  let format: string | undefined;
  try {
    format = (await sharp(input).metadata()).format;
  } catch {
    throw new UploadError("That file isn't a readable image.");
  }
  if (!format || !ALLOWED_FORMATS.has(format)) throw new UploadError("Only JPEG, PNG or WebP images are allowed.");

  const { data, info } = await sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}

export function assertPdf(input: Buffer): void {
  if (input.byteLength > MAX_PDF_BYTES) throw new UploadError("PDFs must be 15 MB or smaller.");
  if (input.subarray(0, 5).toString("latin1") !== "%PDF-") throw new UploadError("That file isn't a PDF.");
}
