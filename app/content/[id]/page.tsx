"use client"

import { use, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Video,
  Code,
  Shield,
  Globe,
  CheckCircle2,
  Sparkles,
} from "lucide-react"

interface ContentData {
  id: string
  title: string
  description: string
  price: string
  content_type: string
  merchant_address: string
  seller_wallet: string
}

interface DeliveredContent {
  type: string
  data?: string
  url?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  apiUrl?: string
}

export default function ContentDisplayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [content, setContent] = useState<ContentData | null>(null)
  const [deliveredContent, setDeliveredContent] = useState<DeliveredContent | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    loadContent()
    checkWalletConnection()
  }, [])

  const loadContent = async () => {
    try {
      const response = await fetch(`/api/content/${resolvedParams.id}`)
      const data = await response.json()
      if (data.success) {
        setContent(data.content)
      } else {
        setError("Content not found")
      }
    } catch (err) {
      console.error("Error loading content:", err)
      setError("Failed to load content")
    } finally {
      setLoading(false)
    }
  }

  const checkWalletConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          await loadDeliveredContent(accounts[0])
        }
      } catch (error) {
        console.error("Error checking wallet:", error)
      }
    }
  }

  const loadDeliveredContent = async (address: string) => {
    try {
      const response = await fetch(`/api/content/${resolvedParams.id}/deliver`, {
        headers: {
          "X-Buyer-Address": address,
        },
      })
      const data = await response.json()
      if (data.success) {
        setDeliveredContent(data.content)
      }
    } catch (error) {
      console.error("Error loading delivered content:", error)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="w-10 h-10" />
      case "image":
        return <ImageIcon className="w-10 h-10" />
      case "video":
        return <Video className="w-10 h-10" />
      case "api":
        return <Code className="w-10 h-10" />
      default:
        return <FileText className="w-10 h-10" />
    }
  }

  const renderContent = () => {
    if (!deliveredContent || !content) return null

    switch (content.content_type) {
      case "text":
        return (
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                Your Content
              </CardTitle>
              <CardDescription className="text-base">Premium content unlocked via x402 payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-muted/50 rounded-xl border-2">
                <p className="whitespace-pre-wrap text-base leading-relaxed">{deliveredContent.data}</p>
              </div>
            </CardContent>
          </Card>
        )

      case "image":
        return (
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                Your Image
              </CardTitle>
              <CardDescription className="text-base">Premium image unlocked via x402 payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl overflow-hidden border-2">
                <img src={deliveredContent.url || "/placeholder.svg"} alt={content.title} className="w-full h-auto" />
              </div>
              <Button variant="outline" className="w-full h-12 text-base bg-transparent" asChild>
                <a href={deliveredContent.url} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-5 h-5 mr-2" />
                  Download Image
                </a>
              </Button>
            </CardContent>
          </Card>
        )

      case "video":
        return (
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                Your Video
              </CardTitle>
              <CardDescription className="text-base">Premium video unlocked via x402 payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl overflow-hidden border-2">
                <video src={deliveredContent.url} controls className="w-full h-auto" />
              </div>
              <Button variant="outline" className="w-full h-12 text-base bg-transparent" asChild>
                <a href={deliveredContent.url} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-5 h-5 mr-2" />
                  Download Video
                </a>
              </Button>
            </CardContent>
          </Card>
        )

      case "file":
        return (
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                Your File
              </CardTitle>
              <CardDescription className="text-base">Premium file unlocked via x402 payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-lg">
                  <Download className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold mb-2">{deliveredContent.fileName}</p>
                  <p className="text-base text-muted-foreground">
                    {deliveredContent.fileSize ? `${(deliveredContent.fileSize / 1024).toFixed(2)} KB` : ""}
                  </p>
                </div>
                <Button className="h-14 text-lg font-semibold shadow-md" asChild>
                  <a href={deliveredContent.url} download target="_blank" rel="noopener noreferrer">
                    <Download className="w-5 h-5 mr-2" />
                    Download File
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "api":
        return (
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                API Access
              </CardTitle>
              <CardDescription className="text-base">Premium API access unlocked via x402 payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-semibold mb-3 text-muted-foreground">API Endpoint:</p>
                <code className="block p-4 bg-muted rounded-xl text-base font-mono border-2 break-all">
                  {deliveredContent.apiUrl}
                </code>
              </div>
              <Button variant="outline" className="w-full h-12 text-base bg-transparent" asChild>
                <a href={deliveredContent.apiUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Open API
                </a>
              </Button>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto animate-pulse shadow-lg">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Content Not Found</CardTitle>
            <CardDescription className="text-center text-base">
              {error || "This content does not exist or has been removed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full h-12" asChild>
              <a href="/">Return Home</a>
            </Button>
          </CardContent>
        </Card>
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
                    <path d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.43 38.88l14.3 14.32z"></path>
                    <path d="M0 63.31l14.3-14.3 14.31 14.3-14.3 14.3z"></path>
                    <path d="M38.73 73.41l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88 14.3-14.32z"></path>
                    <path d="M98 63.31l14.3-14.3 14.31 14.3-14.3 14.3z"></path>
                    <path d="M77.83 63.3L63.32 48.78 52.59 59.51l-1.246 1.245-2.045 2.046 14.51 14.52 14.51-14.51.02-.02z"></path>
                  </g>
                </svg>
                <span className="text-xs font-semibold">BSC</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Success Banner */}
          <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center flex-shrink-0 shadow-md">
                <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  Payment Verified!
                  <Sparkles className="w-6 h-6 text-green-600" />
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Your payment has been confirmed on-chain via the x402 protocol. Access to{" "}
                  <span className="font-semibold text-foreground">{content.title}</span> is now unlocked.
                </p>
              </div>
            </div>
          </div>

          {/* Content Info Card */}
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {getContentIcon(content.content_type)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{content.title}</CardTitle>
                  {content.description && (
                    <CardDescription className="text-base leading-relaxed">{content.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 p-5 bg-muted/50 rounded-xl border-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Price Paid</p>
                  <p className="text-xl font-bold">{content.price} BNB</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Content Type</p>
                  <p className="text-xl font-bold capitalize">{content.content_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivered Content */}
          {deliveredContent && renderContent()}

          {/* Info Box */}
          <div className="p-5 bg-blue-500/10 border-2 border-blue-500/20 rounded-xl">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Secure Access:</strong> This content was unlocked using zero-knowledge
              payment verification on BSC. Your transaction is permanently recorded on-chain.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
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
