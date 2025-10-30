export const X402_VERSION = 1
export const NETWORK_STRING = "bsc" // BSC mainnet

export interface PaymentRequirement {
  scheme: "exact"
  network: string
  amount: string // in BNB
  payTo: string // relayer address
  resource: string // protected resource URL
  description: string
  contentId: string
}

export interface PaymentRequirementsResponse {
  x402Version: number
  error: string
  paymentRequired: PaymentRequirement
}

export interface AttestationPayload {
  txHash: string
  contentId: string
  from: string
  amount: string
  merchantAddress: string
  timestamp: number
  network: string
}

export function createPaymentRequirements(
  contentId: string,
  relayerAddress: string,
  priceInEth: string,
  description: string,
): PaymentRequirementsResponse {
  return {
    x402Version: X402_VERSION,
    error: "Payment required to access this content",
    paymentRequired: {
      scheme: "exact",
      network: NETWORK_STRING,
      amount: priceInEth,
      payTo: relayerAddress,
      resource: `/api/content/${contentId}/deliver`,
      description,
      contentId,
    },
  }
}

export async function verifyAttestation(
  attestation: string,
  contentId: string,
): Promise<{ verified: boolean; payload?: AttestationPayload; error?: string }> {
  try {
    const jwt = (await import("jsonwebtoken")).default
    const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-key-change-in-production"

    const decoded = jwt.verify(attestation, JWT_SECRET) as AttestationPayload

    if (decoded.contentId !== contentId) {
      return { verified: false, error: "Attestation content ID mismatch" }
    }

    return { verified: true, payload: decoded }
  } catch (error) {
    console.error("[v0] Error verifying attestation:", error)
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Invalid attestation",
    }
  }
}
