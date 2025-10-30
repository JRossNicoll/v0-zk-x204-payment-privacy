export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { createContent, getContentBySeller } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId")

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID required" }, { status: 400 })
    }

    const contents = await getContentBySeller(sellerId)

    return NextResponse.json({ success: true, contents })
  } catch (error) {
    console.error("[v0] Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/seller/content called")
    const data = await request.json()
    console.log("[v0] Request data:", { ...data, contentData: data.contentData ? "[REDACTED]" : null })

    const {
      sellerId,
      merchantAddress,
      title,
      description,
      price,
      contentType,
      contentData,
      filePath,
      fileName,
      fileSize,
      mimeType,
    } = data

    if (!sellerId || !merchantAddress || !title || !price || !contentType) {
      console.error("[v0] Missing required fields:", { sellerId, merchantAddress, title, price, contentType })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Creating content in database...")
    const content = await createContent({
      sellerId,
      merchantAddress,
      title,
      description,
      price,
      contentType,
      contentData,
      filePath,
      fileName,
      fileSize,
      mimeType,
    })

    console.log("[v0] Content created successfully:", content.id)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zk-x402.tech"
    const shareableLink = `${baseUrl}/pay/${content.id}`

    return NextResponse.json({
      success: true,
      content,
      shareableLink,
    })
  } catch (error) {
    console.error("[v0] Error creating content - Full error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        error: "Failed to create content",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
