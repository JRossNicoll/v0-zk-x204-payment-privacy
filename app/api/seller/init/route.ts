export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { createSeller, getSellerByWallet } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    // Check if seller exists
    let seller = await getSellerByWallet(walletAddress)

    // Create seller if doesn't exist
    if (!seller) {
      seller = await createSeller(walletAddress)
    }

    return NextResponse.json({
      success: true,
      sellerId: seller.id,
      walletAddress: seller.wallet_address,
    })
  } catch (error) {
    console.error("[v0] Error initializing seller:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize seller",
        details: error instanceof Error ? error.message : String(error),
        hint: "Make sure database tables are created by running the init-database.ts script",
      },
      { status: 500 },
    )
  }
}
