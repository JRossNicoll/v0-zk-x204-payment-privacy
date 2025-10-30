import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { bsc } from "viem/chains"

export const runtime = "nodejs"

const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-key-change-in-production"
const PAYMENT_AMOUNT = "0.001" // BNB
const RELAYER_ADDRESS = process.env.RELAYER_ADDRESS || "0xd3ecf2aac5588b445a1fe7a8194bb0f806685275"
const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS || "0xd24a482e965dd2aec07539f36ac0fc7335f4c78d"
const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL || "https://bsc-dataseed.bnbchain.org"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/x402 called")

    const paymentHeader = request.headers.get("X-PAYMENT")
    console.log("[v0] Payment header:", paymentHeader ? "Present" : "Not present")

    if (!paymentHeader) {
      console.log("[v0] Returning 402 Payment Required")
      return NextResponse.json(
        {
          error: "Payment Required",
          paymentInfo: {
            amount: PAYMENT_AMOUNT,
            currency: "BNB",
            recipient: RELAYER_ADDRESS,
            merchant: MERCHANT_ADDRESS,
            network: "BNB Smart Chain",
            memo: "ZK-X402 Demo Payment",
          },
        },
        {
          status: 402,
          headers: {
            "WWW-Authenticate": "X-PAYMENT",
          },
        },
      )
    }

    console.log("[v0] Verifying JWT attestation")

    const jwt = (await import("jsonwebtoken")).default

    let decoded: any
    try {
      decoded = jwt.verify(paymentHeader, JWT_SECRET)
      console.log("[v0] JWT verified successfully:", decoded)
    } catch (err) {
      console.error("[v0] JWT verification failed:", err)
      return NextResponse.json({ error: "Invalid payment attestation" }, { status: 401 })
    }

    console.log("[v0] Verifying transaction on blockchain:", decoded.txHash)

    const publicClient = createPublicClient({
      chain: bsc,
      transport: http(ALCHEMY_RPC_URL),
    })

    const tx = await publicClient.getTransaction({
      hash: decoded.txHash as `0x${string}`,
    })

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found on blockchain" }, { status: 400 })
    }

    // Verify transaction details match attestation
    if (tx.to?.toLowerCase() !== RELAYER_ADDRESS.toLowerCase()) {
      return NextResponse.json({ error: "Transaction recipient mismatch" }, { status: 400 })
    }

    console.log("[v0] Payment verified successfully, returning content")

    return NextResponse.json({
      success: true,
      content: {
        title: "ZK-X402 Protected Content",
        message: "Congratulations! You have successfully accessed this protected content using the x402 protocol.",
        data: {
          secretData:
            "🎉 This is premium content that requires payment to access. Your payment has been verified on-chain!",
          timestamp: new Date().toISOString(),
          paymentVerified: true,
          transactionHash: decoded.txHash,
          network: "BNB Smart Chain",
          amount: decoded.amount,
          from: decoded.from,
        },
      },
    })
  } catch (error) {
    console.error("[v0] Error in GET /api/x402:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
