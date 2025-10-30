/**
 * ZK-X402 Relayer Service
 *
 * This script monitors incoming transactions to the relayer address,
 * forwards payments to the merchant, and issues signed attestations.
 *
 * Run with: node --loader ts-node/esm scripts/relayer.ts
 */

import { createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"
import { sign } from "jsonwebtoken"

// Configuration
const RELAYER_PRIVATE_KEY = (process.env.RELAYER_PRIVATE_KEY ||
  "0xc321683e61ac8f1f83abf3641da5c5c0a31fbe51217e0d09e5886fc528c3750c") as `0x${string}`
const MERCHANT_ADDRESS = (process.env.MERCHANT_ADDRESS || "0xd24a482e965dd2aec07539f36ac0fc7335f4c78d") as `0x${string}`
const JWT_SECRET = process.env.JWT_SECRET || "zk-x402-demo-secret-key-change-in-production"
const ALCHEMY_RPC_URL =
  process.env.ALCHEMY_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/CB96lmCb3cPLg_voLlDsmrelayer"
const POLL_INTERVAL = 5000 // 5 seconds

if (!RELAYER_PRIVATE_KEY) {
  console.error("Error: RELAYER_PRIVATE_KEY environment variable is required")
  process.exit(1)
}

if (!MERCHANT_ADDRESS) {
  console.error("Error: MERCHANT_ADDRESS environment variable is required")
  process.exit(1)
}

// Initialize clients
const account = privateKeyToAccount(RELAYER_PRIVATE_KEY)

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(ALCHEMY_RPC_URL),
})

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(ALCHEMY_RPC_URL),
})

// Track processed transactions
const processedTxs = new Set<string>()
let lastCheckedBlock = 0n

interface PaymentAttestation {
  amount: string
  txHashRelayer: string
  txHashMerchant: string
  timestamp: number
  nonce: string
}

async function generateAttestation(relayerTxHash: string, merchantTxHash: string, amount: string): Promise<string> {
  const attestation: PaymentAttestation = {
    amount,
    txHashRelayer: relayerTxHash,
    txHashMerchant: merchantTxHash,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(7),
  }

  return sign(attestation, JWT_SECRET, { algorithm: "HS256" })
}

async function forwardPayment(amount: bigint, originalTxHash: string) {
  try {
    console.log(`[v0] Forwarding ${amount} wei to merchant...`)

    const hash = await walletClient.sendTransaction({
      to: MERCHANT_ADDRESS,
      value: amount,
    })

    console.log(`[v0] Merchant payment sent: ${hash}`)

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    if (receipt.status === "success") {
      console.log(`[v0] Merchant payment confirmed!`)

      // Generate attestation
      const attestation = await generateAttestation(originalTxHash, hash, amount.toString())

      console.log(`[v0] Attestation generated:`)
      console.log(attestation)
      console.log("\n---\n")

      // In production, you would:
      // 1. Store this in a database keyed by originalTxHash
      // 2. Provide an API endpoint for users to retrieve it
      // 3. Or push it to the user via websocket/webhook

      return attestation
    } else {
      console.error("[v0] Merchant payment failed")
      return null
    }
  } catch (error) {
    console.error("[v0] Error forwarding payment:", error)
    return null
  }
}

async function checkForIncomingTransactions() {
  try {
    const currentBlock = await publicClient.getBlockNumber()

    if (lastCheckedBlock === 0n) {
      lastCheckedBlock = currentBlock - 10n // Start from 10 blocks ago
    }

    // Get transactions in recent blocks
    for (let i = lastCheckedBlock + 1n; i <= currentBlock; i++) {
      const block = await publicClient.getBlock({
        blockNumber: i,
        includeTransactions: true,
      })

      if (!block.transactions) continue

      for (const tx of block.transactions) {
        if (typeof tx === "string") continue

        // Check if transaction is to our relayer address
        if (tx.to?.toLowerCase() === account.address.toLowerCase() && !processedTxs.has(tx.hash)) {
          console.log(`[v0] New incoming transaction detected: ${tx.hash}`)
          console.log(`[v0] Amount: ${tx.value} wei`)
          console.log(`[v0] From: ${tx.from}`)

          processedTxs.add(tx.hash)

          // Forward payment to merchant
          await forwardPayment(tx.value, tx.hash)
        }
      }
    }

    lastCheckedBlock = currentBlock
  } catch (error) {
    console.error("[v0] Error checking transactions:", error)
  }
}

async function main() {
  console.log("=== ZK-X402 Relayer Service ===")
  console.log(`Relayer Address: ${account.address}`)
  console.log(`Merchant Address: ${MERCHANT_ADDRESS}`)
  console.log(`Network: Sepolia`)
  console.log(`RPC URL: ${ALCHEMY_RPC_URL}`)
  console.log(`Polling interval: ${POLL_INTERVAL}ms`)
  console.log("\nWaiting for incoming transactions...\n")

  // Start polling for transactions
  setInterval(checkForIncomingTransactions, POLL_INTERVAL)
}

main().catch(console.error)
