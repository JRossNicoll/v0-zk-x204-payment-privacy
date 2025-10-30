export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { verifyContentAccess } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const { contentId } = await params
    const { searchParams } = new URL(request.url)
    const buyerAddress = searchParams.get("buyerAddress")

    if (!buyerAddress) {
      return NextResponse.json({ error: "Buyer address required" }, { status: 400 })
    }

    const hasPaid = await verifyContentAccess(contentId, buyerAddress)

    return NextResponse.json({ success: true, hasPaid })
  } catch (error) {
    console.error("[v0] Error verifying access:", error)
    return NextResponse.json({ error: "Failed to verify access" }, { status: 500 })
  }
}
