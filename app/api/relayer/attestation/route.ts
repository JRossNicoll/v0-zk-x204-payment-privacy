export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, createWalletClient, http, parseEther } from "viem"
import { bsc } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"
import { getContentById } from "@/lib/db"

const RELAYER_ADDRESS = (process.env.RELAYER_ADDRESS || "0xd3ecf2aac5588b445a1fe7a8194bb0f806685275").toLowerCase()
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || ""
const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL || "https://bsc-dataseed.bnbchain.org"
const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-key-change-in-production"
const PLATFORM_FEE_PERCENT = 2.5 // 2.5% platform fee

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/relayer/attestation called")

    const body = await request.json()
    const { txHash, contentId } = body

    if (!txHash) {
      return NextResponse.json({ error: "Missing transaction hash" }, { status: 400 })
    }

    if (!contentId) {
      return NextResponse.json({ error: "Missing content ID" }, { status: 400 })
    }

    console.log("[v0] Processing payment for content:", contentId)

    // Get content details to verify merchant address and price
    const content = await getContentById(contentId)

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    const merchantAddress = content.merchant_address.toLowerCase()
    const expectedAmount = content.price

    console.log("[v0] Checking transaction:", txHash)
    console.log("[v0] Expected merchant:", merchantAddress)
    console.log("[v0] Expected amount:", expectedAmount, "ETH")

    const publicClient = createPublicClient({
      chain: bsc,
      transport: http(ALCHEMY_RPC_URL),
    })

    // Get transaction details
    const tx = await publicClient.getTransaction({
      hash: txHash as `0x${string}`,
    })

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    console.log("[v0] Transaction found:", {
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
    })

    if (tx.to?.toLowerCase() !== RELAYER_ADDRESS) {
      return NextResponse.json(
        {
          error: `Transaction must be sent to relayer address: ${RELAYER_ADDRESS}`,
        },
        { status: 400 },
      )
    }

    const expectedWei = parseEther(expectedAmount)
    if (tx.value < expectedWei) {
      return NextResponse.json(
        {
          error: `Insufficient payment. Expected ${expectedAmount} ETH, received ${Number(tx.value) / 1e18} ETH`,
        },
        { status: 400 },
      )
    }

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
      confirmations: 1,
    })

    if (receipt.status !== "success") {
      return NextResponse.json({ error: "Transaction failed" }, { status: 400 })
    }

    console.log("[v0] Transaction confirmed")

    const totalAmount = Number(tx.value) / 1e18
    const platformFee = totalAmount * (PLATFORM_FEE_PERCENT / 100)
    const merchantAmount = totalAmount - platformFee

    console.log("[v0] Payment breakdown:", {
      total: totalAmount,
      platformFee,
      merchantAmount,
    })

    if (RELAYER_PRIVATE_KEY) {
      try {
        const account = privateKeyToAccount(`0x${RELAYER_PRIVATE_KEY}` as `0x${string}`)

        const walletClient = createWalletClient({
          account,
          chain: bsc,
          transport: http(ALCHEMY_RPC_URL),
        })

        const forwardHash = await walletClient.sendTransaction({
          to: merchantAddress as `0x${string}`,
          value: parseEther(merchantAmount.toString()),
        })

        console.log("[v0] Payment forwarded to merchant:", forwardHash)

        // Wait for forward transaction confirmation
        await publicClient.waitForTransactionReceipt({
          hash: forwardHash,
          confirmations: 1,
        })

        console.log("[v0] Forward transaction confirmed")
      } catch (forwardError) {
        console.error("[v0] Error forwarding payment:", forwardError)
        // Continue with attestation even if forwarding fails (can be retried)
      }
    } else {
      console.warn("[v0] RELAYER_PRIVATE_KEY not set, skipping payment forwarding")
    }

    const jwt = (await import("jsonwebtoken")).default

    const attestation = jwt.sign(
      {
        txHash: txHash,
        contentId: contentId,
        from: tx.from,
        amount: totalAmount.toString(),
        merchantAddress: merchantAddress,
        timestamp: Date.now(),
        network: "bsc",
        relayerAddress: RELAYER_ADDRESS,
        platformFee: platformFee.toString(),
        merchantAmount: merchantAmount.toString(),
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log("[v0] Attestation generated successfully")

    return NextResponse.json({
      success: true,
      attestation,
      txHash,
      contentId,
      payment: {
        total: totalAmount,
        platformFee,
        merchantAmount,
        merchantAddress,
      },
      from: tx.from,
      confirmations: 1,
    })
  } catch (error) {
    console.error("[v0] Error in relayer attestation:", error)
    return NextResponse.json(
      {
        error: "Failed to process payment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
