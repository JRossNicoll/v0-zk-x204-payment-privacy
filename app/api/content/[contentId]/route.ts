export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { getContentById } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const { contentId } = await params

    const content = await getContentById(contentId)

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Return public content info (no sensitive data)
    return NextResponse.json({
      success: true,
      content: {
        id: content.id,
        title: content.title,
        description: content.description,
        price: content.price,
        content_type: content.content_type,
        merchant_address: content.merchant_address,
        seller_wallet: content.seller_wallet,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}
