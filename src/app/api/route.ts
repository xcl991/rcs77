import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Test MongoDB connection
    await prisma.$connect();
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      users: userCount
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      database: "disconnected",
      error: error.message
    }, { status: 500 });
  }
}