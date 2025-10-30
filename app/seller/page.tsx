"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Wallet,
  Upload,
  Copy,
  Check,
  FileText,
  ImageIcon,
  Video,
  Code,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Shield,
  Loader2,
  ExternalLink,
  X,
  ChevronDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    ethereum?: any
  }
}

interface Content {
  id: string
  title: string
  description: string
  price: string
  content_type: string
  created_at: string
  merchant_address: string
}

export default function SellerDashboard() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [sellerId, setSellerId] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)
  const [contents, setContents] = useState<Content[]>([])
  const [copiedId, setCopiedId] = useState<string>("")
  const { toast } = useToast()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [contentType, setContentType] = useState("text")
  const [contentData, setContentData] = useState("")
  const [file, setFile] = useState<File | null>(null)

  // Step management state
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [newContentId, setNewContentId] = useState<string>("")
  const [copiedLink, setCopiedLink] = useState(false)

  const [isSelectOpen, setIsSelectOpen] = useState(false)

  useEffect(() => {
    initializeDatabase()
    checkWalletConnection()
  }, [])

  useEffect(() => {
    if (sellerId) {
      loadSellerContent()
    }
  }, [sellerId])

  const initializeDatabase = async () => {
    try {
      console.log("[v0] Initializing database...")
      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        console.log("[v0] Database initialized:", data.message)
      } else {
        console.error("[v0] Database initialization failed:", data.error)
      }
    } catch (error) {
      console.error("[v0] Error initializing database:", error)
    }
  }

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          await initializeSeller(accounts[0])
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
      await initializeSeller(accounts[0])
      toast({
        title: "Wallet connected",
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const initializeSeller = async (address: string) => {
    try {
      const response = await fetch("/api/seller/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Error initializing seller:", errorData)
        return
      }

      const data = await response.json()
      console.log("[v0] Seller initialized:", data)
      setSellerId(data.sellerId)
    } catch (error) {
      console.error("[v0] Error initializing seller:", error)
    }
  }

  const loadSellerContent = async () => {
    try {
      const response = await fetch(`/api/seller/content?sellerId=${sellerId}`)
      const data = await response.json()
      setContents(data.contents || [])
    } catch (error) {
      console.error("Error loading content:", error)
    }
  }

  const handleCreateContent = async (e: any) => {
    e?.preventDefault()
    console.log("[v0] Starting content creation...")

    if (!title || !price || !contentType) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, price, and select a content type.",
        variant: "destructive",
      })
      return
    }

    if (!walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      let uploadedFilePath = null
      let fileName = null
      let fileSize = null
      let mimeType = null

      // Upload file if content type requires it
      if (["file", "image", "video"].includes(contentType) && file) {
        console.log("[v0] Uploading file...")
        const formData = new FormData()
        formData.append("file", file)
        formData.append("contentType", contentType)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || "Upload failed")
        }

        const uploadData = await uploadResponse.json()
        uploadedFilePath = uploadData.url
        fileName = file.name
        fileSize = file.size
        mimeType = file.type
      }

      console.log("[v0] Creating content record...")
      const response = await fetch("/api/seller/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: sellerId || `seller_${walletAddress.slice(0, 8)}`,
          merchantAddress: walletAddress,
          title,
          description,
          price,
          contentType,
          contentData: contentType === "text" || contentType === "api" ? contentData : null,
          filePath: uploadedFilePath,
          fileName,
          fileSize,
          mimeType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create content")
      }

      const data = await response.json()

      if (data.success && data.content) {
        setNewContentId(data.content.id)
        setShowSuccessModal(true)
        toast({
          title: "Success!",
          description: "Your content has been published successfully.",
        })
        // Reset form
        setTitle("")
        setDescription("")
        setPrice("")
        setContentData("")
        setFile(null)
        setCurrentStep(1)
        setCompletedSteps([])
        loadSellerContent()
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create content",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const copyPaywallLink = (contentId: string) => {
    const link = `https://zk-x402.tech/pay/${contentId}`
    navigator.clipboard.writeText(link)
    setCopiedId(contentId)
    setTimeout(() => setCopiedId(""), 2000)
    toast({
      title: "Link copied",
      description: "Paywall link copied to clipboard",
    })
  }

  const copyPaywallLinkFromModal = () => {
    const link = `https://zk-x402.tech/pay/${newContentId}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    toast({
      title: "Link copied",
      description: "Paywall link copied to clipboard",
    })
  }

  const viewPaywallPage = () => {
    window.open(`/pay/${newContentId}`, "_blank")
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="w-4 h-4" />
      case "image":
        return <ImageIcon className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "api":
        return <Code className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  // Step validation functions
  const isStep1Complete = walletAddress !== ""
  const isStep2Complete = title !== "" && price !== "" && description !== ""
  const isStep3Complete =
    (contentType === "text" && contentData !== "") ||
    (contentType === "api" && contentData !== "") ||
    (["file", "image", "video"].includes(contentType) && file !== null)

  const canProceedToStep = (step: number) => {
    if (step === 2) return isStep1Complete
    if (step === 3) return isStep1Complete && isStep2Complete
    if (step === 4) return isStep1Complete && isStep2Complete && isStep3Complete
    return true
  }

  const goToNextStep = () => {
    if (currentStep < 4 && canProceedToStep(currentStep + 1)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b-2 border-primary/20 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-2 md:py-0 md:h-14 gap-2 md:gap-0">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <a href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2.5">
                <img src="/zk-logo.png" alt="ZK Logo" className="h-8 md:h-10 w-auto" />
              </a>

              <div className="flex md:hidden items-center gap-2">
                {walletAddress ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 h-8 bg-transparent border-primary/30 hover:border-primary hover:bg-primary/10"
                  >
                    <Wallet className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {walletAddress.slice(0, 4)}...{walletAddress.slice(-3)}
                    </span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={connectWallet}
                    className="flex items-center gap-2 h-8 bg-transparent border-primary/30 hover:border-primary hover:bg-primary/10"
                  >
                    <Wallet className="w-3 h-3" />
                    <span className="text-xs font-medium">Connect</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-8 bg-gradient-to-r from-primary/10 to-yellow-500/10 border-primary/30 hover:border-primary px-2"
                >
                  <svg
                    fill="currentColor"
                    width="16px"
                    height="16px"
                    viewBox="0 0 24 24"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m16.624 13.92 2.717 2.716-7.353 7.353-7.352-7.352 2.717-2.717 4.636 4.66 4.635-4.66zm4.637-4.636L24 12l-2.715 2.716L18.568 12l2.693-2.716zm-9.272 0 2.716 2.692-2.717 2.717L9.272 12l2.716-2.715zm-9.273 0L5.41 12l-2.692 2.692L0 12l2.716-2.716zM11.99.01l7.352 7.33-2.717 2.715-4.636-4.636-4.635 4.66-2.717-2.716L11.989.011z" />
                  </svg>
                  <span className="text-xs font-semibold">BSC</span>
                </Button>
              </div>
            </div>

            <nav className="flex flex-row items-center gap-4 md:gap-8 md:absolute md:left-1/2 md:-translate-x-1/2">
              <button
                onClick={() => (window.location.href = "/")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-center whitespace-nowrap"
              >
                Overview
              </button>
              <button className="text-sm font-semibold text-foreground border-b-2 border-primary pb-1 transition-colors text-center whitespace-nowrap">
                Start Selling
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-center whitespace-nowrap"
              >
                Buy Content
              </button>
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-center whitespace-nowrap">
                $ZK
              </button>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {walletAddress ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-9 bg-transparent border-primary/30 hover:border-primary hover:bg-primary/10"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connectWallet}
                  className="flex items-center gap-2 h-9 bg-transparent border-primary/30 hover:border-primary hover:bg-primary/10"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">Connect Wallet</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1 h-9 bg-gradient-to-r from-primary/10 to-yellow-500/10 border-primary/30 hover:border-primary px-2.5"
              >
                <svg
                  fill="currentColor"
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m16.624 13.92 2.717 2.716-7.353 7.353-7.352-7.352 2.717-2.717 4.636 4.66 4.635-4.66zm4.637-4.636L24 12l-2.715 2.716L18.568 12l2.693-2.716zm-9.272 0 2.716 2.692-2.717 2.717L9.272 12l2.716-2.715zm-9.273 0L5.41 12l-2.692 2.692L0 12l2.716-2.716zM11.99.01l7.352 7.33-2.717 2.715-4.636-4.636-4.635 4.66-2.717-2.716L11.989.011z" />
                </svg>
                <span className="text-xs font-semibold">BSC</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {!walletAddress && currentStep === 1 ? (
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-6 shadow-lg">
                <Wallet className="w-10 h-10 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <CardTitle className="text-3xl mb-3">Connect Your Wallet</CardTitle>
              <CardDescription className="text-base">
                Connect your wallet to start creating and selling protected content
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-8">
              <Button onClick={connectWallet} className="w-full h-14 text-lg font-semibold shadow-md">
                <Wallet className="w-6 h-6 mr-3" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8 max-w-4xl w-full">
            {/* Seller Information Box */}
            <Card className="shadow-lg border-2">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Shield className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">Seller Dashboard</h2>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        Create and monetize protected content with zero-knowledge payment verification. Set your price,
                        upload your content, and start earning crypto payments instantly.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Instant Payments</p>
                        <p className="text-xs text-muted-foreground">Receive crypto payments directly to your wallet</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-primary" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Secure Access</p>
                        <p className="text-xs text-muted-foreground">Content protected by blockchain verification</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Upload className="w-5 h-5 text-primary" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Any Content Type</p>
                        <p className="text-xs text-muted-foreground">Text, files, images, videos, or API access</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step Wizard */}
            <Card className="shadow-lg border-2">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4].map((step, index) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-md ${
                            completedSteps.includes(step) || currentStep > step
                              ? "bg-gradient-to-br from-green-500 to-green-600 text-white scale-105"
                              : currentStep === step
                                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground scale-110"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {completedSteps.includes(step) || currentStep > step ? (
                            <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
                          ) : (
                            step
                          )}
                        </div>
                        <span
                          className={`text-sm mt-3 font-semibold ${currentStep === step ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {step === 1 && "Connect"}
                          {step === 2 && "Details"}
                          {step === 3 && "Content"}
                          {step === 4 && "Review"}
                        </span>
                      </div>
                      {index < 3 && (
                        <div
                          className={`h-1 flex-1 mx-4 rounded-full transition-all ${completedSteps.includes(step) || currentStep > step ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-muted"}`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>

            {currentStep === 1 && (
              <Card className="shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-500" strokeWidth={2.5} />
                    </div>
                    Wallet Connected
                  </CardTitle>
                  <CardDescription className="text-base">
                    Your wallet is connected and ready to create content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-green-600" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-base mb-1">Connected Address</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button onClick={goToNextStep} className="w-full h-14 text-lg font-semibold shadow-md">
                    Continue to Content Details
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl">Content Details</CardTitle>
                  <CardDescription className="text-base">
                    Provide basic information about your protected content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-semibold">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="My Premium Content"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-semibold">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what buyers will get access to..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="price" className="text-base font-semibold">
                      Price (BNB) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.0001"
                      placeholder="0.001"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-12 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Set the price buyers will pay to access your content
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={goToPreviousStep}
                      variant="outline"
                      className="flex-1 h-14 text-base font-semibold bg-transparent"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={goToNextStep}
                      disabled={!isStep2Complete}
                      className="flex-1 h-14 text-base font-semibold shadow-md"
                    >
                      Continue to Content Upload
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl">Content Upload</CardTitle>
                  <CardDescription className="text-base">
                    Choose your content type and upload or enter your content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <div className="space-y-3">
                    <Label htmlFor="contentType" className="text-base font-semibold">
                      Content Type *
                    </Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                        className="w-full h-12 px-4 py-2 text-left bg-background border border-input rounded-md flex items-center justify-between hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <div className="flex items-center gap-3">
                          {contentType === "text" && <FileText className="w-5 h-5" />}
                          {contentType === "file" && <Upload className="w-5 h-5" />}
                          {contentType === "image" && <ImageIcon className="w-5 h-5" />}
                          {contentType === "video" && <Video className="w-5 h-5" />}
                          {contentType === "api" && <Code className="w-5 h-5" />}
                          <span className="text-base capitalize">
                            {contentType === "text" && "Text Content"}
                            {contentType === "file" && "File Download"}
                            {contentType === "image" && "Image"}
                            {contentType === "video" && "Video"}
                            {contentType === "api" && "API Access"}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </button>
                      {isSelectOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-md shadow-lg">
                          {[
                            { value: "text", icon: FileText, label: "Text Content" },
                            { value: "file", icon: Upload, label: "File Download" },
                            { value: "image", icon: ImageIcon, label: "Image" },
                            { value: "video", icon: Video, label: "Video" },
                            { value: "api", icon: Code, label: "API Access" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setContentType(option.value)
                                setIsSelectOpen(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-3 transition-colors"
                            >
                              <option.icon className="w-5 h-5" />
                              <span className="text-base">{option.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {(contentType === "text" || contentType === "api") && (
                    <div className="space-y-3">
                      <Label htmlFor="contentData" className="text-base font-semibold">
                        {contentType === "text" ? "Content *" : "API URL *"}
                      </Label>
                      <Textarea
                        id="contentData"
                        placeholder={
                          contentType === "text" ? "Enter your premium content here..." : "https://api.example.com/data"
                        }
                        value={contentData}
                        onChange={(e) => setContentData(e.target.value)}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                  )}

                  {["file", "image", "video"].includes(contentType) && (
                    <div className="space-y-3">
                      <Label htmlFor="file" className="text-base font-semibold">
                        Upload File *
                      </Label>
                      <div className="border-2 border-dashed rounded-xl p-10 text-center hover:border-primary/50 transition-all hover:bg-accent/5">
                        <Input
                          id="file"
                          type="file"
                          accept={contentType === "image" ? "image/*" : contentType === "video" ? "video/*" : "*"}
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="file" className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          {file ? (
                            <div className="space-y-2">
                              <p className="font-semibold text-lg">{file.name}</p>
                              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                              <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                                Change File
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-base font-semibold mb-1">Click to upload</p>
                              <p className="text-sm text-muted-foreground">or drag and drop</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={goToPreviousStep}
                      variant="outline"
                      className="flex-1 h-14 text-base font-semibold bg-transparent"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={goToNextStep}
                      disabled={!isStep3Complete}
                      className="flex-1 h-14 text-base font-semibold shadow-md"
                    >
                      Continue to Review
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl">Review & Publish</CardTitle>
                  <CardDescription className="text-base">Review your content details before publishing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pb-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-muted/50 rounded-xl space-y-5 border-2">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Title</p>
                        <p className="font-bold text-lg">{title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Description</p>
                        <p className="text-base">{description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2 font-medium">Price</p>
                          <p className="font-bold text-lg">{price} BNB</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2 font-medium">Content Type</p>
                          <p className="font-bold text-lg capitalize">{contentType}</p>
                        </div>
                      </div>
                      {file && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2 font-medium">File</p>
                          <p className="text-base font-semibold">{file.name}</p>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-7 h-7 text-green-600" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="font-bold text-lg mb-2">Ready to Publish</p>
                          <p className="text-sm text-muted-foreground">
                            Your content will be published and a paywall link will be generated
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={goToPreviousStep}
                      variant="outline"
                      className="flex-1 h-14 text-base font-semibold bg-transparent"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleCreateContent}
                      disabled={isCreating}
                      className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" strokeWidth={2.5} />
                          Publish Content
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {contents.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl">Your Published Content</CardTitle>
                  <CardDescription className="text-base">
                    Manage your paywalled content and share links with buyers
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-3">
                    {contents.map((content) => (
                      <div
                        key={content.id}
                        className="flex items-center justify-between p-5 border-2 rounded-xl hover:bg-accent/50 transition-all hover:border-primary/30"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            {getContentIcon(content.content_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold truncate text-base">{content.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {content.price} BNB • {new Date(content.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => copyPaywallLink(content.id)}
                          className="bg-transparent h-11"
                        >
                          {copiedId === content.id ? (
                            <Check className="w-4 h-4 mr-2" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          {copiedId === content.id ? "Copied" : "Copy Link"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader className="relative">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-lg">
                <CheckCircle2 className="w-9 h-9 text-white" strokeWidth={2.5} />
              </div>
              <CardTitle className="text-2xl text-center">Content Published Successfully!</CardTitle>
              <CardDescription className="text-center text-base">
                Your content is now live. Share this link with buyers to start earning.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Shareable Link */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Shareable Paywall Link</Label>
                <div className="flex gap-2">
                  <div className="flex-1 p-4 bg-muted rounded-lg border-2 border-border">
                    <code className="text-sm break-all">https://zk-x402.tech/pay/{newContentId}</code>
                  </div>
                  <Button
                    onClick={copyPaywallLinkFromModal}
                    variant="outline"
                    size="icon"
                    className="h-auto w-14 bg-transparent"
                  >
                    {copiedLink ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={viewPaywallPage} variant="outline" className="h-12 bg-transparent">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview Paywall
                </Button>
                <Button onClick={copyPaywallLinkFromModal} className="h-12">
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border-2 border-blue-500/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Next steps:</strong> Share this link on social media, your
                  website, or directly with customers. When they pay, you'll receive BNB directly to your wallet.
                </p>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setShowSuccessModal(false)}
                variant="outline"
                className="w-full h-12 bg-transparent"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <footer className="border-t-2 border-primary/20 bg-card/80 backdrop-blur-md mt-auto shadow-2xl shadow-primary/10 relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-3">
            <div className="flex items-center gap-2.5">
              <img src="/zk-logo.png" alt="ZK Logo" className="h-7 w-auto" />
              <div className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">ZK-X402</span> © 2025
              </div>
            </div>

            <nav className="flex items-center gap-6">
              <a
                href="https://x402.gitbook.io/x402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                Docs
              </a>
              <a
                href="https://github.com/murrlin Lincoln/x402-gitbook"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://x402.gitbook.io/x402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
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
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50"></div>
              <span className="font-semibold">BSC Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
