import { NextResponse } from "next/server";
import prisma from "@/lib/postgres";

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {},
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const existingSettings = await prisma.settings.findFirst();
    
    const settings = await prisma.settings.upsert({
      where: { id: existingSettings?.id || 'default' },
      update: {
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
      },
      create: {
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
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}