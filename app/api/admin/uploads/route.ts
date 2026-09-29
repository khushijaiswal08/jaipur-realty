import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { AuthError, assertAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { assertPdf, processImage, UploadError } from "@/lib/server/images";
import { saveFile } from "@/lib/server/storage";
import { logAudit } from "@/services/audit.service";

// Admin uploads (SPEC §36, §44). POST multipart/form-data:
//   file         — the upload
//   target       — "property" | "project" | "brochure" | "image"
//   targetId     — property/project id when target is property/project (creates the image record)

export const maxDuration = 60;

const ID = /^[a-z0-9]{20,32}$/;

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Cross-origin upload rejected." }, { status: 403 });

  let admin;
  try {
    admin = await assertAdmin();
  } catch (e) {
    return NextResponse.json({ error: e instanceof AuthError ? e.message : "Unauthorised" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const target = String(form.get("target") ?? "image");
  const targetId = String(form.get("targetId") ?? "");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });

  const needsListings = target === "property" || target === "project" || target === "brochure";
  try {
    await assertAdmin(needsListings ? "manageListings" : "manageContent");
  } catch (e) {
    return NextResponse.json({ error: e instanceof AuthError ? e.message : "Forbidden" }, { status: 403 });
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());

    if (target === "brochure") {
      assertPdf(input);
      const stored = await saveFile(input, "pdf", "application/pdf");
      await logAudit(admin.id, "upload.brochure", "Upload", stored.key);
      return NextResponse.json({ url: stored.url });
    }

    const image = await processImage(input);
    const stored = await saveFile(image.buffer, "webp", "image/webp");

    if ((target === "property" || target === "project") && ID.test(targetId)) {
      const altBase = String(form.get("alt") ?? "").trim();
      if (target === "property") {
        const property = await db.property.findUnique({ where: { id: targetId }, select: { title: true, slug: true, _count: { select: { images: true } } } });
        if (!property) return NextResponse.json({ error: "Property not found." }, { status: 404 });
        const count = property._count.images;
        const row = await db.propertyImage.create({
          data: {
            propertyId: targetId,
            url: stored.url,
            alt: altBase || `${property.title} — photo ${count + 1}`,
            width: image.width,
            height: image.height,
            sortOrder: count,
            isCover: count === 0,
          },
        });
        await logAudit(admin.id, "property.image_add", "Property", targetId, { imageId: row.id });
        revalidatePath(`/property/${property.slug}`);
        return NextResponse.json({ id: row.id, url: stored.url, width: image.width, height: image.height });
      }
      const project = await db.project.findUnique({ where: { id: targetId }, select: { name: true, slug: true, _count: { select: { images: true } } } });
      if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
      const count = project._count.images;
      const row = await db.projectImage.create({
        data: {
          projectId: targetId,
          url: stored.url,
          alt: altBase || `${project.name} — image ${count + 1}`,
          width: image.width,
          height: image.height,
          sortOrder: count,
          isCover: count === 0,
        },
      });
      await logAudit(admin.id, "project.image_add", "Project", targetId, { imageId: row.id });
      revalidatePath(`/projects/${project.slug}`);
      return NextResponse.json({ id: row.id, url: stored.url, width: image.width, height: image.height });
    }

    await logAudit(admin.id, "upload.image", "Upload", stored.key);
    return NextResponse.json({ url: stored.url, width: image.width, height: image.height });
  } catch (e) {
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("[upload] failed", e);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
