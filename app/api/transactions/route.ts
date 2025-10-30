export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { createTransaction } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { contentId, txHash, buyerAddress, amount, attestation, status } = data

    if (!contentId || !txHash || !buyerAddress || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const transaction = await createTransaction({
      contentId,
      txHash,
      buyerAddress,
      amount,
      attestation,
      status: status || "confirmed",
    })

    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error("[v0] Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
