export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { getContentById, verifyContentAccess, logContentAccess } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const { contentId } = await params
    const buyerAddress = request.headers.get("X-Buyer-Address")

    if (!buyerAddress) {
      return NextResponse.json({ error: "Buyer address required" }, { status: 400 })
    }

    // Verify payment
    const hasPaid = await verifyContentAccess(contentId, buyerAddress)

    if (!hasPaid) {
      return NextResponse.json({ error: "Payment required" }, { status: 402 })
    }

    // Get content
    const content = await getContentById(contentId)

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Log access
    const transactions = await import("@/lib/db").then((m) => m.getTransactionsByContent(contentId))
    const userTransaction = transactions.find(
      (tx: any) => tx.buyer_address === buyerAddress && tx.status === "confirmed",
    )

    if (userTransaction) {
      await logContentAccess({
        contentId,
        buyerAddress,
        txHash: userTransaction.tx_hash,
      })
    }

    // Deliver content based on type
    let deliveredContent: any = {}

    switch (content.content_type) {
      case "text":
        deliveredContent = {
          type: "text",
          data: content.content_data,
        }
        break

      case "image":
      case "video":
      case "file":
        deliveredContent = {
          type: content.content_type,
          url: content.file_path,
          fileName: content.file_name,
          fileSize: content.file_size,
          mimeType: content.mime_type,
        }
        break

      case "api":
        deliveredContent = {
          type: "api",
          apiUrl: content.content_data,
        }
        break

      default:
        return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      content: deliveredContent,
    })
  } catch (error) {
    console.error("[v0] Error delivering content:", error)
    return NextResponse.json({ error: "Failed to deliver content" }, { status: 500 })
  }
}
