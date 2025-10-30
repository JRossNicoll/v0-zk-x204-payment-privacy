import { type NextRequest, NextResponse } from "next/server"
import { getContentById } from "@/lib/db"
import { createPaymentRequirements, verifyAttestation } from "@/lib/x402"

export const runtime = "nodejs"

const RELAYER_ADDRESS = (process.env.RELAYER_ADDRESS || "0xd3ecf2aac5588b445a1fe7a8194bb0f806685275").toLowerCase()

export async function GET(request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const { contentId } = await params
    console.log("[v0] x402 GET request for content:", contentId)

    // Check if attestation is provided
    const attestation = request.headers.get("X-Attestation") || request.nextUrl.searchParams.get("attestation")

    if (!attestation) {
      // No payment provided - return 402 with payment requirements
      console.log("[v0] No attestation provided, fetching content...")
      const content = await getContentById(contentId)

      if (!content) {
        console.log("[v0] Content not found:", contentId)
        return NextResponse.json({ error: "Content not found" }, { status: 404 })
      }

      console.log("[v0] Content found, creating payment requirements...")
      const paymentRequirements = createPaymentRequirements(contentId, RELAYER_ADDRESS, content.price, content.title)

      console.log("[v0] Returning 402 Payment Required")
      return NextResponse.json(paymentRequirements, { status: 402 })
    }

    // Attestation provided - verify and deliver content
    console.log("[v0] Attestation provided, verifying...")
    const verification = await verifyAttestation(attestation, contentId)

    if (!verification.verified) {
      console.log("[v0] Attestation verification failed")
      return NextResponse.json(
        { error: "Attestation verification failed", details: verification.error },
        { status: 402 },
      )
    }

    // Attestation verified - deliver content
    const content = await getContentById(contentId)

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    console.log("[v0] Attestation verified, delivering content")

    return NextResponse.json({
      success: true,
      content: {
        id: content.id,
        title: content.title,
        description: content.description,
        contentType: content.content_type,
        data: content.content_data,
        filePath: content.file_path,
      },
      payment: verification.payload,
    })
  } catch (error) {
    console.error("[v0] Error in x402 route:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
