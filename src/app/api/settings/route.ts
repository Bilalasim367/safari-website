import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { invalidateMetaSettings } from "@/lib/meta";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  const auth = await verifyToken(token);
  if (!auth || auth.role !== "admin") return null;
  return auth;
}

const PIXEL_ID_PATTERN = /^\d{6,20}$/;

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function cleanBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

/**
 * Strip write-only secrets before sending settings to the dashboard.
 * The UI only needs to know whether a token is already saved.
 */
function maskSettings<T extends {
  metaCapiToken: string | null;
  metaCatalogToken: string | null;
}>(settings: T) {
  const { metaCapiToken, metaCatalogToken, ...rest } = settings;
  return {
    ...rest,
    metaCapiToken: null,
    metaCatalogToken: null,
    hasMetaCapiToken: Boolean(metaCapiToken),
    hasMetaCatalogToken: Boolean(metaCatalogToken),
  };
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: {},
      });
    }

    return NextResponse.json(maskSettings(settings));
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // This endpoint is used by several dashboards, so a request may only carry
    // the fields it owns (e.g. the marketing page sends Meta settings only).
    // `undefined` means "leave unchanged"; `null` or "" means "clear".
    const has = (key: string) => body[key] !== undefined;

    // Validate the Pixel ID up front: a typo here silently disables tracking.
    const rawPixelId = body.metaPixelId;
    const pixelId =
      typeof rawPixelId === "string" && rawPixelId.trim() ? rawPixelId.trim() : null;
    if (has("metaPixelId") && pixelId && !PIXEL_ID_PATTERN.test(pixelId)) {
      return NextResponse.json(
        { error: "Meta Pixel ID must be 6–20 digits (numbers only)." },
        { status: 400 }
      );
    }

    const existingSettings = await prisma.settings.findFirst();

    /*
     * Secrets are write-only. The dashboard receives `null` for the token and
     * a `has...` flag, so a blank field means "keep what is already saved"
     * rather than "erase the token".
     */
    const capiToken = cleanString(body.metaCapiToken);
    const catalogToken = cleanString(body.metaCatalogToken);

    const data = {
      storeName: body.storeName,
      storeEmail: body.storeEmail,
      storePhone: body.storePhone,
      storeAddress: body.storeAddress,
      currency: body.currency,
      timezone: body.timezone,
      taxRate: body.taxRate,
      shippingFee: body.shippingFee,
      freeShippingThreshold: body.freeShippingThreshold,
      emailNotifications: body.emailNotifications,
      orderEmails: body.orderEmails,
      marketingEmails: body.marketingEmails,
      smtpHost: body.smtpHost,
      smtpPort: body.smtpPort,
      smtpUser: body.smtpUser,
      smtpPassword: body.smtpPassword,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      metaKeywords: body.metaKeywords,

      metaPixelEnabled: cleanBoolean(body.metaPixelEnabled),
      metaPixelId: has("metaPixelId") ? pixelId : undefined,
      metaCapiEnabled: cleanBoolean(body.metaCapiEnabled),
      metaTestEventCode:
        body.metaTestEventCode === undefined
          ? undefined
          : cleanString(body.metaTestEventCode),
      metaDomainVerification:
        body.metaDomainVerification === undefined
          ? undefined
          : cleanString(body.metaDomainVerification),
      ...(capiToken ? { metaCapiToken: capiToken } : {}),
      ...(catalogToken ? { metaCatalogToken: catalogToken } : {}),
    };

    const settings = await prisma.settings.upsert({
      where: { id: existingSettings?.id || "default" },
      update: data,
      create: data,
    });

    // The storefront caches Meta config for 60s; drop it so a save is instant.
    invalidateMetaSettings();

    return NextResponse.json(maskSettings(settings));
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
