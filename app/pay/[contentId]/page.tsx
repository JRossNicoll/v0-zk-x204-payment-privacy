"use client"

import { use, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Wallet,
  Lock,
  Check,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Video,
  Code,
  Shield,
  Globe,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    ethereum?: any
  }
}

interface ContentData {
  id: string
  title: string
  description: string
  price: string
  content_type: string
  merchant_address: string
  seller_wallet: string
}

export default function PaywallPage({ params }: { params: Promise<{ contentId: string }> }) {
  const resolvedParams = use(params)
  const [content, setContent] = useState<ContentData | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [isPaying, setIsPaying] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [deliveredContent, setDeliveredContent] = useState<any>(null)
  const [txHash, setTxHash] = useState<string>("")
  const { toast } = useToast()

  const RELAYER_ADDRESS = "0xd3ecf2aac5588b445a1fe7a8194bb0f806685275"

  useEffect(() => {
    loadContent()
    checkWalletConnection()
  }, [])

  useEffect(() => {
    if (walletAddress && content) {
      checkIfPaid()
    }
  }, [walletAddress, content])

  const loadContent = async () => {
    try {
      const response = await fetch(`/api/content/${resolvedParams.contentId}`)
      const data = await response.json()
      if (data.success) {
        setContent(data.content)
      } else {
        toast({
          title: "Content not found",
          description: "This content does not exist or has been removed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading content:", error)
    }
  }

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
        }
      } catch (error) {
        console.error("Error checking wallet:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to continue",
        variant: "destructive",
      })
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      setWalletAddress(accounts[0])
      toast({
        title: "Wallet connected",
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const checkIfPaid = async () => {
    try {
      const response = await fetch(`/api/content/${resolvedParams.contentId}/verify?buyerAddress=${walletAddress}`)
      const data = await response.json()
      if (data.hasPaid) {
        setIsPaid(true)
        await loadDeliveredContent()
      }
    } catch (error) {
      console.error("Error checking payment:", error)
    }
  }

  const loadDeliveredContent = async () => {
    try {
      const response = await fetch(`/api/content/${resolvedParams.contentId}/deliver`, {
        headers: {
          "X-Buyer-Address": walletAddress,
        },
      })
      const data = await response.json()
      if (data.success) {
        setDeliveredContent(data.content)
      }
    } catch (error) {
      console.error("Error loading content:", error)
    }
  }

  const handlePayment = async () => {
    console.log("[v0] handlePayment called")
    console.log("[v0] walletAddress:", walletAddress)
    console.log("[v0] content:", content)

    if (!walletAddress || !content) {
      console.log("[v0] Missing walletAddress or content, returning early")
      return
    }

    console.log("[v0] Starting payment process...")
    setIsPaying(true)

    try {
      // Fetching payment requirements from x402 endpoint
      console.log("[v0] Fetching payment requirements from x402 endpoint")
      const requirementsResponse = await fetch(`/api/content/${resolvedParams.contentId}/x402`)

      console.log("[v0] x402 response status:", requirementsResponse.status)

      if (requirementsResponse.status !== 402) {
        console.log("[v0] ERROR: Expected 402 status, got:", requirementsResponse.status)
        throw new Error("Expected 402 Payment Required response")
      }

      const paymentRequirements = await requirementsResponse.json()
      console.log("[v0] Payment requirements:", paymentRequirements)

      const requirement = paymentRequirements.paymentRequired

      if (!requirement) {
        console.log("[v0] ERROR: No payment requirement found in response")
        throw new Error("Invalid payment requirements response")
      }

      const amountInBnb = Number.parseFloat(requirement.amount)
      const amountInWei = Math.floor(amountInBnb * 1e18).toString()

      console.log("[v0] Amount in BNB:", amountInBnb)
      console.log("[v0] Amount in wei:", amountInWei)
      console.log("[v0] Payment to address:", requirement.payTo)

      const transactionParameters = {
        to: requirement.payTo,
        from: walletAddress,
        value: "0x" + BigInt(amountInWei).toString(16),
      }

      console.log("[v0] Transaction parameters:", transactionParameters)
      console.log("[v0] Requesting transaction from MetaMask...")

      const hash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      })

      console.log("[v0] Transaction hash received:", hash)
      setTxHash(hash)

      toast({
        title: "Transaction sent",
        description: "Waiting for confirmation...",
      })

      console.log("[v0] Waiting for transaction confirmation...")
      await waitForTransaction(hash)

      console.log("[v0] Transaction confirmed!")
      toast({
        title: "Transaction confirmed",
        description: "Verifying payment with x402 protocol...",
      })

      const jwt = await import("jsonwebtoken")
      const JWT_SECRET = "demo-secret-key-change-in-production"

      const attestationPayload = {
        txHash: hash,
        contentId: resolvedParams.contentId,
        from: walletAddress,
        amount: requirement.amount,
        merchantAddress: requirement.payTo,
        timestamp: Date.now(),
        network: requirement.network,
      }

      const attestation = jwt.sign(attestationPayload, JWT_SECRET)

      console.log("[v0] Retrying request with X-Attestation header")
      const contentResponse = await fetch(`/api/content/${resolvedParams.contentId}/x402`, {
        headers: {
          "X-Attestation": attestation,
        },
      })

      console.log("[v0] Content response status:", contentResponse.status)

      if (!contentResponse.ok) {
        const error = await contentResponse.json()
        console.log("[v0] Content response error:", error)
        throw new Error(error.error || "Payment verification failed")
      }

      const contentData = await contentResponse.json()
      console.log("[v0] Content delivered:", contentData)

      console.log("[v0] Recording transaction in database...")
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: resolvedParams.contentId,
          txHash: hash,
          buyerAddress: walletAddress,
          amount: content.price,
          attestation: attestation,
          status: "confirmed",
        }),
      })

      console.log("[v0] Transaction recorded successfully")
      setIsPaid(true)
      setDeliveredContent(contentData.content)

      toast({
        title: "Payment successful",
        description: "Content unlocked via x402 protocol!",
      })

      console.log("[v0] Redirecting to content page...")
      setTimeout(() => {
        window.location.href = `/content/${resolvedParams.contentId}`
      }, 1500)
    } catch (error) {
      console.error("[v0] Error processing payment:", error)
      console.error("[v0] Error details:", error instanceof Error ? error.message : String(error))
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      console.log("[v0] Payment process completed, resetting isPaying state")
      setIsPaying(false)
    }
  }

  const waitForTransaction = async (hash: string) => {
    return new Promise((resolve) => {
      const checkTransaction = async () => {
        try {
          const receipt = await window.ethereum.request({
            method: "eth_getTransactionReceipt",
            params: [hash],
          })
          if (receipt) {
            resolve(receipt)
          } else {
            setTimeout(checkTransaction, 2000)
          }
        } catch (error) {
          setTimeout(checkTransaction, 2000)
        }
      }
      checkTransaction()
    })
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="w-8 h-8" />
      case "image":
        return <ImageIcon className="w-8 h-8" />
      case "video":
        return <Video className="w-8 h-8" />
      case "api":
        return <Code className="w-8 h-8" />
      default:
        return <FileText className="w-8 h-8" />
    }
  }

  const renderContent = () => {
    if (!deliveredContent) return null

    switch (content?.content_type) {
      case "text":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{deliveredContent.data}</p>
              </div>
            </CardContent>
          </Card>
        )

      case "image":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={deliveredContent.url || "/placeholder.svg"} alt={content.title} className="w-full rounded-lg" />
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <a href={deliveredContent.url} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </a>
              </Button>
            </CardContent>
          </Card>
        )

      case "video":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Video</CardTitle>
            </CardHeader>
            <CardContent>
              <video src={deliveredContent.url} controls className="w-full rounded-lg" />
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <a href={deliveredContent.url} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </a>
              </Button>
            </CardContent>
          </Card>
        )

      case "file":
        return (
          <Card>
            <CardHeader>
              <CardTitle>File Download</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Download className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">{deliveredContent.fileName}</p>
                <p className="text-sm text-muted-foreground mb-4">{(deliveredContent.fileSize / 1024).toFixed(2)} KB</p>
                <Button asChild>
                  <a href={deliveredContent.url} download target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "api":
        return (
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">API Endpoint:</p>
                  <code className="block p-3 bg-muted rounded text-sm">{deliveredContent.apiUrl}</code>
                </div>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href={deliveredContent.apiUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open API
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-md flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-semibold tracking-tight">ZK-X204</span>
            </a>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 h-9 bg-transparent">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">BSC</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1 h-9 bg-transparent px-2.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 126.61 126.61"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <g>
                    <path d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.43 38.9l14.3 14.31zm-14.3 10.12L10.11 49.01 0 59.12l10.11 10.11 14.32-14.3zm14.3 10.12l24.59 24.58 24.6-24.6 14.31 14.29-38.9 38.91-38.9-38.88 14.3-14.32zm75.57-10.12l14.31-14.31-10.11-10.11-14.32 14.32 10.12 10.11z"></path>
                    <path d="M77.83 63.32L63.32 48.81 52.59 59.54l-2.14 2.14-.01.01-1.93 1.93 14.51 14.5 14.51-14.51.01-.01z"></path>
                  </g>
                </svg>
                <span className="text-xs font-semibold">BSC</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-2xl w-full space-y-6">
          {/* Content Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {getContentIcon(content.content_type)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{content.title}</CardTitle>
                  {content.description && (
                    <CardDescription className="text-base">{content.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">{content.price} BNB</p>
                  <p className="text-xs text-muted-foreground mt-1">Includes 2.5% platform fee</p>
                </div>
                {isPaid && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">Paid</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          {!isPaid && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Content Locked
                </CardTitle>
                <CardDescription>Connect your wallet and pay to unlock this content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!walletAddress ? (
                  <Button onClick={connectWallet} className="w-full">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                    <Button onClick={handlePayment} disabled={isPaying} className="w-full">
                      {isPaying ? "Processing..." : `Pay ${content.price} BNB`}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Payment will be sent to relayer and forwarded to merchant
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delivered Content */}
          {isPaid && deliveredContent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Content Unlocked</h2>
              </div>
              {renderContent()}
              {txHash && (
                <p className="text-sm text-muted-foreground text-center">
                  Transaction:{" "}
                  <a
                    href={`https://bscscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
            {/* Logo and Copyright */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/70 rounded-md flex items-center justify-center shadow-sm">
                <Shield className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">ZK-X204</span> © 2025
              </div>
            </div>

            <nav className="flex items-center gap-6">
              <a
                href="https://x402.gitbook.io/x402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </a>
              <a
                href="https://github.com/murrlincoln/x402-gitbook"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://x402.gitbook.io/x402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                API
              </a>
              <a
                href="https://x.com/zK_x402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.244H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://t.me/zKX402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </a>
            </nav>

            {/* Network Status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-medium">Network Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
