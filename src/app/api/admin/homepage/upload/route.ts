import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { requireAdmin, unauthorized } from "@/lib/admin-guard"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

/**
 * Local image upload for homepage content.
 *
 * Runs on the cPanel Node server, so images are written to
 * `public/uploads/homepage/<uuid>.<ext>` and served as `/uploads/homepage/...`.
 * This deliberately does not depend on the Vercel Blob token (the cPanel host
 * does not have one configured).
 */
export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorized()

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "Expected a file upload" }, { status: 400 })
  }

  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 })
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "The selected file is empty" }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be smaller than 8 MB" }, { status: 400 })
  }

  const extension = EXTENSIONS[file.type.toLowerCase()]
  if (!extension) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP or GIF images are allowed" },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${randomUUID()}.${extension}`

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "homepage")
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)
  } catch (error) {
    console.error("Homepage image upload failed:", error)
    return NextResponse.json(
      { error: "Could not save the image on the server" },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: `/uploads/homepage/${filename}` }, { status: 201 })
}
