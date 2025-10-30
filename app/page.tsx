"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UiuiCursorGlow } from "@/components/uiui-cursor-glow"
import { UiuiScrollReveal } from "@/components/uiui-scroll-reveal"
import { UiuiScrollProgress } from "@/components/uiui-scroll-progress"
import { UiuiBackground } from "@/components/uiui-background"

export default function ZKX402Demo() {
  const [activeSection, setActiveSection] = useState("start")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["start", "how", "why", "prism"]
      const scrollPosition = window.scrollY + window.innerHeight / 2

      sections.forEach((section) => {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
          }
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const carousel = document.getElementById("prism-carousel")
    if (!carousel) return

    const handleCarouselScroll = () => {
      const scrollLeft = carousel.scrollLeft
      const slideWidth = carousel.offsetWidth
      const currentSlide = Math.round(scrollLeft / slideWidth)
      setActiveSlide(currentSlide)
    }

    carousel.addEventListener("scroll", handleCarouselScroll)
    return () => carousel.removeEventListener("scroll", handleCarouselScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <UiuiCursorGlow />
      <UiuiScrollProgress />
      <UiuiBackground />

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-6 left-6 z-50 lg:hidden glass-subtle rounded-xl p-3 border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed left-6 top-20 glass-strong rounded-2xl p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setActiveSection("start")
                window.scrollTo({ top: 0, behavior: "smooth" })
                setMobileMenuOpen(false)
              }}
              className={`block w-full text-left px-6 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                activeSection === "start" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Start
            </button>
            <button
              onClick={() => {
                setActiveSection("why")
                document.getElementById("why")?.scrollIntoView({ behavior: "smooth" })
                setMobileMenuOpen(false)
              }}
              className={`block w-full text-left px-6 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                activeSection === "why" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Why
            </button>
            <button
              onClick={() => {
                setActiveSection("how")
                document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
                setMobileMenuOpen(false)
              }}
              className={`block w-full text-left px-6 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                activeSection === "how" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              How
            </button>
            <button
              onClick={() => {
                window.location.href = "/seller"
                setMobileMenuOpen(false)
              }}
              className="block w-full text-left px-6 py-4 rounded-xl text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              Demo
            </button>
            <button
              onClick={() => {
                setActiveSection("prism")
                document.getElementById("prism")?.scrollIntoView({ behavior: "smooth" })
                setMobileMenuOpen(false)
              }}
              className={`block w-full text-left px-6 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                activeSection === "prism" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Prism
            </button>
          </div>
        </div>
      )}

      <nav className="fixed left-0 top-0 h-screen w-[72px] z-50 hidden lg:flex flex-col items-center py-8 glass-subtle border-r border-white/8">
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <button
            onClick={() => {
              setActiveSection("start")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`writing-mode-vertical text-sm font-medium tracking-widest uppercase transition-all duration-300 ${
              activeSection === "start"
                ? "text-white border-l-2 border-[#ff6b35] pl-6"
                : "text-gray-500 hover:text-white pl-6"
            }`}
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            Start
          </button>
          <button
            onClick={() => {
              setActiveSection("why")
              document.getElementById("why")?.scrollIntoView({ behavior: "smooth" })
            }}
            className={`writing-mode-vertical text-sm font-medium tracking-widest uppercase transition-all duration-300 ${
              activeSection === "why"
                ? "text-white border-l-2 border-[#ff6b35] pl-6"
                : "text-gray-500 hover:text-white pl-6"
            }`}
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            Why
          </button>
          <button
            onClick={() => {
              setActiveSection("how")
              document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
            }}
            className={`writing-mode-vertical text-sm font-medium tracking-widest uppercase transition-all duration-300 ${
              activeSection === "how"
                ? "text-white border-l-2 border-[#ff6b35] pl-6"
                : "text-gray-500 hover:text-white pl-6"
            }`}
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            How
          </button>
          <button
            onClick={() => (window.location.href = "/seller")}
            className="writing-mode-vertical text-sm font-medium tracking-widest uppercase text-gray-500 hover:text-white transition-all duration-300 pl-6"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            Demo
          </button>
          <button
            onClick={() => {
              setActiveSection("prism")
              document.getElementById("prism")?.scrollIntoView({ behavior: "smooth" })
            }}
            className={`writing-mode-vertical text-sm font-medium tracking-widest uppercase transition-all duration-300 ${
              activeSection === "prism"
                ? "text-white border-l-2 border-[#ff6b35] pl-6"
                : "text-gray-500 hover:text-white pl-6"
            }`}
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            Prism
          </button>
        </div>

        <button className="w-8 h-8 rounded-full glass-subtle border border-white/20 hover:border-white/40 hover:bg-white/10 flex items-center justify-center transition-all duration-300 group">
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </nav>

      <main className="relative z-10 lg:ml-[72px]">
        <section
          id="start"
          className="min-h-screen flex flex-col items-center justify-center px-6 scroll-snap-section relative"
        >
          <div className="flex items-center justify-center gap-3 mb-12">
            <button
              onClick={() => (window.location.href = "/seller")}
              className="glass-subtle border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/5 hover:border-white/30 transition-all duration-300 group"
            >
              <img src="/zk-logo.png" alt="ZK" className="w-3.5 h-3.5" />
              <span className="text-sm font-medium text-white">Try it out</span>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>
            <button
              onClick={() => window.open("https://x.com/zK_X402", "_blank")}
              className="relative bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-full px-6 py-3 flex items-center gap-2.5 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              <img src="/zk-logo.png" alt="ZK" className="w-3.5 h-3.5 relative z-10" />
              <span className="text-sm font-semibold text-white relative z-10">Join the cult (zk_x402)</span>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 relative z-10" />
            </button>
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-6">
            <h1 className="leading-[0.95]">
              <div className="text-[clamp(48px,8vw,96px)] font-extralight tracking-[-0.04em] text-white">Transform</div>
              <div className="text-[clamp(56px,9vw,112px)] font-bold tracking-[-0.05em] gradient-text uppercase my-1">
                x402
              </div>
              <div className="text-[clamp(48px,8vw,96px)] font-extralight tracking-[-0.04em] text-white">
                Into Privacy Payments
              </div>
            </h1>

            <p className="text-lg font-light text-[#a3a3a3] max-w-[700px] mx-auto leading-[1.7] tracking-[0.01em]">
              Enable zero-knowledge payments with cryptographic attestations. Privacy relayer for P2P transactions with
              instant verification.
            </p>

            <p className="text-sm font-normal text-[#737373] tracking-[0.02em] leading-[1.6] mt-6">
              No accounts. No friction. Just autonomous privacy.
            </p>

            <div className="flex items-center justify-center gap-4 pt-12">
              <button
                onClick={() => (window.location.href = "/seller")}
                className="uiui-button-secondary flex items-center gap-2"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Watch Demo
              </button>
              <button
                onClick={() => window.open("https://x.com/zK_X402", "_blank")}
                className="glass-subtle border border-white/20 rounded-full px-8 py-[14px] text-[15px] font-medium text-white hover:border-white/40 hover:bg-white/5 transition-all duration-200 flex items-center gap-2"
              >
                Join (zk_x402)
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-8">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#737373] tracking-[0.03em]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
                <span>No Code</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#737373] tracking-[0.03em]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#737373] tracking-[0.03em]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
                <span>Instant</span>
              </div>
            </div>
          </div>
        </section>

        <UiuiScrollReveal>
          <section id="how" className="min-h-screen py-20 sm:py-32 px-4 sm:px-6 scroll-snap-section">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 sm:mb-20">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6">
                  <span className="text-white">ZK-X402 </span>
                  <span className="gradient-text font-bold">under the hood</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
                  The three core components of our privacy payment protocol
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="glass-card rounded-3xl p-8 hover:scale-105 transition-transform duration-300 flex flex-col">
                  <div className="text-6xl font-bold gradient-text mb-6">1</div>
                  <h3 className="text-2xl font-bold mb-4">Privacy Relayer</h3>
                  <p className="text-sm text-gray-400 mb-6">Payment Anonymization</p>
                  <p className="text-gray-400 leading-relaxed mb-6 flex-1">
                    Routes payments through secure relayer infrastructure, breaking the direct link between sender and
                    receiver for complete transaction privacy.
                  </p>
                  <div className="glass-subtle rounded-xl p-4 space-y-2 text-sm font-mono min-h-[280px] flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-gray-500">Input: Payment Request</div>
                      <div className="text-[#C2B250]">{"{"}</div>
                      <div className="text-gray-300 pl-4">"amount": "0.1 BNB",</div>
                      <div className="text-gray-300 pl-4">"merchant": "0x..."</div>
                      <div className="text-[#C2B250]">{"}"}</div>
                      <div className="text-gray-500 mt-4">Output: Attestation</div>
                      <div className="text-[#D3447C]">zk://payment-verified</div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-500">Verified</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-8 hover:scale-105 transition-transform duration-300 flex flex-col">
                  <div className="text-6xl font-bold gradient-text mb-6">2</div>
                  <h3 className="text-2xl font-bold mb-4">JWT Attestation</h3>
                  <p className="text-sm text-gray-400 mb-6">Cryptographic Proof</p>
                  <p className="text-gray-400 leading-relaxed mb-6 flex-1">
                    Generates cryptographic attestations that prove payment completion without revealing transaction
                    details or wallet addresses.
                  </p>
                  <div className="glass-subtle rounded-xl p-4 space-y-4 text-sm min-h-[280px] flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Generating attestation</span>
                        <div className="w-16 h-1 bg-gradient-to-r from-[#C2B250] to-[#D3447C] rounded-full animate-pulse" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Signing with relayer key</span>
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Verifying on-chain</span>
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="text-gray-500 text-xs mb-2">JWT Token Generated</div>
                        <div className="text-[#C2B250] font-mono text-xs break-all">
                          eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-500">Attestation Complete</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-8 hover:scale-105 transition-transform duration-300 flex flex-col">
                  <div className="text-6xl font-bold gradient-text mb-6">3</div>
                  <h3 className="text-2xl font-bold mb-4">Content Delivery</h3>
                  <p className="text-sm text-gray-400 mb-6">Instant Access</p>
                  <p className="text-gray-400 leading-relaxed mb-6 flex-1">
                    Delivers paywalled content immediately upon payment verification, enabling seamless monetization for
                    digital goods and services.
                  </p>
                  <div className="glass-subtle rounded-xl p-4 space-y-4 min-h-[280px] flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C2B250] to-[#D3447C] flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-medium">Content Unlocked</div>
                          <div className="text-gray-500 text-sm">Ready to access</div>
                        </div>
                      </div>
                      <div className="border-t border-white/10 pt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Download Speed</span>
                          <span className="text-white font-medium">Instant</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Access Duration</span>
                          <span className="text-white font-medium">Lifetime</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">File Format</span>
                          <span className="text-white font-medium">Any</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-500">Payment verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </UiuiScrollReveal>

        <UiuiScrollReveal delay={200}>
          <section id="why" className="min-h-screen py-20 sm:py-32 px-4 sm:px-6 scroll-snap-section">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 sm:mb-20">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6">
                  <span className="text-white">Why </span>
                  <span className="gradient-text font-bold">ZK-X402</span>
                  <span className="text-white"> Works Better</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
                  Three revolutionary principles that make ZK-X402 the most powerful privacy payment protocol
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="glass-card rounded-3xl p-10 text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C2B250] to-[#D3447C] mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Zero Friction</h3>
                  <p className="text-sm text-gray-400 mb-4">No Accounts Required</p>
                  <p className="text-gray-400 leading-relaxed">
                    Payment → Content. Skip the signup forms, KYC, and account management entirely.
                  </p>
                </div>

                <div className="glass-card rounded-3xl p-10 text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D3447C] to-[#6B5391] mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 01-8 0v-6a2 2 0 01-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 01-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Pure Privacy</h3>
                  <p className="text-sm text-gray-400 mb-4">Zero-Knowledge Proofs</p>
                  <p className="text-gray-400 leading-relaxed">
                    Cryptographic attestations that prove payment without revealing transaction details.
                  </p>
                </div>

                <div className="glass-card rounded-3xl p-10 text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6B5391] to-[#C2B250] mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Complete Security</h3>
                  <p className="text-sm text-gray-400 mb-4">On-Chain Verification</p>
                  <p className="text-gray-400 leading-relaxed">
                    Every payment is verified on BSC blockchain with cryptographic proof of completion.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </UiuiScrollReveal>

        <UiuiScrollReveal delay={300}>
          <section id="prism" className="min-h-screen py-20 sm:py-32 px-4 sm:px-6 scroll-snap-section relative">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(#ff6b35 1px, transparent 1px), linear-gradient(90deg, #ff6b35 1px, transparent 1px)",
                  backgroundSize: "50px 50px",
                }}
              />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16 sm:mb-24">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-6">
                  <span className="text-white">Protocol </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#D3447C] font-bold">
                    Architecture
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto font-mono text-sm">
                  &gt; System infrastructure and technical specifications
                </p>
              </div>

              <div className="glass-card rounded-xl p-8 sm:p-12 mb-8 relative overflow-hidden border border-[#ff6b35]/20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/5 via-transparent to-[#D3447C]/5" />

                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="w-2 h-2 bg-[#ff6b35] animate-pulse" />
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono uppercase tracking-wider">
                    System Flow
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/50 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {/* Step 1 - Payment Initiation */}
                  <div className="relative group h-[380px]">
                    <div className="glass-subtle rounded-lg p-6 border border-[#ff6b35]/30 hover:border-[#ff6b35] transition-all duration-300 hover:shadow-lg hover:shadow-[#ff6b35]/20 relative overflow-hidden h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#ff6b35]/20 border border-[#ff6b35]/50 flex items-center justify-center font-mono text-[#ff6b35] font-bold">
                          01
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/50 to-transparent" />
                      </div>

                      <h4 className="text-lg font-bold mb-2 text-white font-mono uppercase tracking-wide">
                        Payment Init
                      </h4>
                      <p className="text-gray-400 text-xs mb-4 font-mono">User → Relayer Contract</p>

                      <div className="bg-[#0a0a0a] border border-[#ff6b35]/30 p-3 font-mono text-xs relative overflow-hidden group flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="text-gray-500"> &gt; tx.send()</div>
                          <div className="text-[#D3447C]">relayer: 0x{Array(8).fill("•").join("")}</div>
                          <div className="text-[#ff6b35]">amount: 0.1 BNB</div>
                        </div>
                        <div className="text-green-400 mt-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
                          <span>CONFIRMED</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="flex flex-col gap-1">
                        <div className="w-6 h-px bg-gradient-to-r from-[#ff6b35] to-transparent animate-pulse" />
                        <div
                          className="w-6 h-px bg-gradient-to-r from-[#D3447C] to-transparent animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-6 h-px bg-gradient-to-r from-[#ff6b35] to-transparent animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2 - Attestation Generation */}
                  <div className="relative group h-[380px]">
                    <div className="glass-subtle rounded-lg p-6 border border-[#6B5391]/30 hover:border-[#6B5391] transition-all duration-300 hover:shadow-lg hover:shadow-[#6B5391]/20 relative overflow-hidden h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#6B5391]/20 border border-[#6B5391]/50 flex items-center justify-center font-mono text-[#6B5391] font-bold">
                          02
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#6B5391]/50 to-transparent" />
                      </div>

                      <h4 className="text-lg font-bold mb-2 text-white font-mono uppercase tracking-wide">
                        Attestation
                      </h4>
                      <p className="text-gray-400 text-xs mb-4 font-mono">Cryptographic Proof Gen</p>

                      <div className="bg-[#0a0a0a] border border-[#6B5391]/30 p-3 font-mono text-xs relative overflow-hidden flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Generating attestation</span>
                            <div className="w-16 h-1 bg-gradient-to-r from-[#C2B250] to-[#D3447C] rounded-full animate-pulse" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Signing with relayer key</span>
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Verifying on-chain</span>
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="border-t border-white/10 pt-4 mt-4">
                            <div className="text-gray-500 text-xs mb-2">JWT Token Generated</div>
                            <div className="text-[#C2B250] font-mono text-xs break-all">
                              eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-green-500">Attestation Complete</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="flex flex-col gap-1">
                        <div className="w-6 h-px bg-gradient-to-r from-[#6B5391] to-transparent animate-pulse" />
                        <div
                          className="w-6 h-px bg-gradient-to-r from-[#D3447C] to-transparent animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-6 h-px bg-gradient-to-r from-[#6B5391] to-transparent animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3 - Content Delivery */}
                  <div className="group h-[380px]">
                    <div className="glass-subtle rounded-lg p-6 border border-green-500/30 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 relative overflow-hidden h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-500/20 border border-green-500/50 flex items-center justify-center font-mono text-green-400 font-bold">
                          03
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent" />
                      </div>

                      <h4 className="text-lg font-bold mb-2 text-white font-mono uppercase tracking-wide">Delivery</h4>
                      <p className="text-gray-400 text-xs mb-4 font-mono">Content Unlock</p>

                      <div className="bg-[#0a0a0a] border border-green-500/30 p-3 font-mono text-xs relative overflow-hidden flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C2B250] to-[#D3447C] flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="text-white font-medium">Content Unlocked</div>
                              <div className="text-gray-500 text-sm">Ready to access</div>
                            </div>
                          </div>
                          <div className="border-t border-white/10 pt-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Download Speed</span>
                              <span className="text-white font-medium">Instant</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Access Duration</span>
                              <span className="text-white font-medium">Lifetime</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">File Format</span>
                              <span className="text-white font-medium">Any</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-green-500">Payment verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Security Features */}
                <div className="glass-card rounded-xl p-8 relative overflow-hidden border border-[#ff6b35]/20">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent" />

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-[#ff6b35] animate-pulse" />
                    <h3 className="text-2xl font-bold font-mono uppercase tracking-wider">Security</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/50 to-transparent" />
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Zero-Knowledge Proofs", status: "ACTIVE", metric: "100%" },
                      { label: "On-Chain Verification", status: "ACTIVE", metric: "BSC" },
                      { label: "JWT Attestations", status: "ACTIVE", metric: "256-bit" },
                      { label: "Relayer Anonymization", status: "ACTIVE", metric: "Layer-2" },
                      { label: "Smart Contract Security", status: "AUDITED", metric: "Verified" },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between glass-subtle rounded-lg p-4 border border-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
                          <span className="text-white font-mono text-sm">{feature.label}</span>
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                          <span className="text-gray-400 font-mono text-xs">{feature.metric}</span>
                          <span className="text-green-400 font-mono text-xs font-bold">{feature.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="glass-card rounded-xl p-8 relative overflow-hidden border border-[#6B5391]/20">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6B5391] to-transparent" />

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-[#6B5391] animate-pulse" />
                    <h3 className="text-2xl font-bold font-mono uppercase tracking-wider">Performance</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#6B5391]/50 to-transparent" />
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: "TX_SPEED", value: "< 3s", percent: 95, color: "coral" },
                      { label: "ATTESTATION", value: "< 500ms", percent: 85, color: "purple" },
                      { label: "DELIVERY", value: "instant", percent: 100, color: "green" },
                      { label: "UPTIME", value: "99.9%", percent: 99, color: "coral" },
                      { label: "GAS_OPT", value: "optimized", percent: 90, color: "purple" },
                    ].map((metric, i) => (
                      <div key={i} className="group/metric">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-xs font-mono font-bold uppercase tracking-wider">
                            {metric.label}
                          </span>
                          <span className="text-[#D3447C] text-xs font-mono font-bold">{metric.value}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0a0a0a] border border-[#ff6b35]/20 overflow-hidden relative">
                          <div
                            className={`h-full bg-gradient-to-r ${
                              metric.color === "coral"
                                ? "from-[#ff6b35] to-[#D3447C]"
                                : metric.color === "purple"
                                  ? "from-[#6B5391] to-[#D3447C]"
                                  : "from-green-500 to-green-400"
                            } transition-all duration-1000 ease-out relative`}
                            style={{ width: `${metric.percent}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-scan" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-8 sm:p-12 relative overflow-hidden border border-[#ff6b35]/20">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent animate-pulse" />

                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 bg-[#ff6b35] animate-pulse" />
                  <h3 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-wider">Technical Stack</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#ff6b35]/50 to-transparent" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "BLOCKCHAIN", value: "BSC Mainnet", color: "coral" },
                    { label: "CRYPTO", value: "JWT + ZK", color: "purple" },
                    { label: "INFRA", value: "Relayer Net", color: "coral" },
                    { label: "CONTRACTS", value: "Solidity 0.8+", color: "purple" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="glass-subtle rounded-lg p-6 border border-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/5 via-transparent to-[#6B5391]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#ff6b35] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                      <div className="text-gray-400 text-[10px] uppercase tracking-widest mb-3 font-mono font-bold">
                        {item.label}
                      </div>
                      <div className="text-white font-mono text-sm font-bold mb-4">{item.value}</div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 ${item.color === "coral" ? "bg-[#ff6b35]" : "bg-[#6B5391]"} animate-pulse`}
                        />
                        <span className="text-green-400 font-mono text-xs font-bold">ONLINE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </UiuiScrollReveal>

        <UiuiScrollReveal delay={350}>
          <section id="demo" className="min-h-screen py-20 sm:py-32 px-4 sm:px-6 scroll-snap-section relative">
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, #ff6b35 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
              <div className="text-center mb-16 sm:mb-20">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-6">
                  <span className="text-white">Start </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#D3447C] font-bold">
                    Selling
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                  Create your content, set your price, and start accepting private payments
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Seller Portal Card */}
                <div className="glass-card rounded-2xl p-8 border border-[#ff6b35]/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent" />

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#D3447C] flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">Seller Dashboard</h3>
                      <p className="text-gray-400 text-sm">Upload content and start monetizing with privacy payments</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 glass-subtle rounded-lg border border-[#ff6b35]/20">
                      <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white text-sm">Upload any digital content</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 glass-subtle rounded-lg border border-[#ff6b35]/20">
                      <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white text-sm">Set your own price in BNB</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 glass-subtle rounded-lg border border-[#ff6b35]/20">
                      <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white text-sm">Get paid instantly with privacy</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 glass-subtle rounded-lg border border-[#ff6b35]/20">
                      <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white text-sm">Track sales in real-time</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => (window.location.href = "/seller")}
                    className="w-full h-14 bg-gradient-to-r from-[#ff6b35] to-[#D3447C] hover:from-[#ff7b45] hover:to-[#E3548C] text-white font-semibold text-lg relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    <span className="relative z-10">Go to Seller Dashboard</span>
                    <svg className="w-5 h-5 ml-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </div>

                {/* How It Works */}
                <div className="glass-card rounded-2xl p-8 border border-[#6B5391]/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6B5391] to-transparent" />

                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#6B5391] animate-pulse" />
                    How It Works
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        step: "1",
                        label: "Upload Content",
                        desc: "Add your digital content to sell",
                        color: "from-[#ff6b35] to-[#D3447C]",
                      },
                      {
                        step: "2",
                        label: "Set Price",
                        desc: "Choose your price in BNB",
                        color: "from-[#D3447C] to-[#6B5391]",
                      },
                      {
                        step: "3",
                        label: "Share Link",
                        desc: "Share your unique payment link",
                        color: "from-[#6B5391] to-[#C2B250]",
                      },
                      {
                        step: "4",
                        label: "Get Paid",
                        desc: "Receive payments instantly",
                        color: "from-[#C2B250] to-[#ff6b35]",
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-4 group">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                        >
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">STEP {item.step}</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent" />
                          </div>
                          <p className="text-white font-semibold">{item.label}</p>
                          <p className="text-gray-400 text-sm">{item.desc}</p>
                        </div>
                        {index < 3 && (
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 glass-subtle rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-400 font-semibold">Live on BSC Mainnet</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    ),
                    title: "Instant Payments",
                    description: "Receive payments directly to your wallet in seconds",
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 01-8 0v4h8z"
                        />
                      </svg>
                    ),
                    title: "Complete Privacy",
                    description: "Zero-knowledge proofs protect buyer and seller identities",
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    ),
                    title: "Any Content Type",
                    description: "Sell PDFs, videos, images, code, or any digital file",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="glass-subtle rounded-xl p-6 border border-[#ff6b35]/20 hover:border-[#ff6b35]/50 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#ff6b35]/10 flex items-center justify-center mb-4 text-[#ff6b35] group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </UiuiScrollReveal>

        <UiuiScrollReveal delay={400}>
          <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-20 sm:py-32 scroll-snap-section">
            <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-tight">
                <span className="text-white">Ready to make your payments </span>
                <span className="gradient-text font-bold">private</span>
                <span className="text-white">?</span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4 leading-relaxed">
                ZK-X402 is live on BSC mainnet. Join sellers using privacy-first payments to monetize digital content.
              </p>

              <div className="glass-strong rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto border border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={() => (window.location.href = "/seller")}
                    className="bg-gradient-to-r from-[#ff6b35] to-[#D3447C] hover:from-[#ff7b45] hover:to-[#E3548C] text-white font-semibold px-10 sm:px-12 h-14 sm:h-16 rounded-full transition-all duration-300 shadow-lg shadow-[#ff6b35]/30 text-base sm:text-lg w-full sm:w-auto relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Start Selling
                    </span>
                  </Button>

                  <Button
                    onClick={() => (window.location.href = "/seller")}
                    className="glass-subtle border-2 border-[#ff6b35]/50 hover:border-[#ff6b35] hover:bg-[#ff6b35]/10 text-white font-semibold px-10 sm:px-12 h-14 sm:h-16 rounded-full transition-all duration-300 text-base sm:text-lg w-full sm:w-auto group"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      Buy Content
                    </span>
                  </Button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No accounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Instant access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Full privacy</span>
                  </div>
                </div>
              </div>
              {/* </CHANGE> */}

              <div className="glass-subtle rounded-2xl px-6 py-4 inline-flex items-center gap-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400 font-semibold text-sm">Live on BSC</span>
                </div>
                <span className="text-gray-400 text-sm">All features shown are currently available</span>
              </div>
            </div>
          </section>
        </UiuiScrollReveal>

        <footer className="border-t border-white/10 py-8 sm:py-12 px-4 sm:px-6 relative">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <a
                href="https://x.com/zK_X402"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </a>
              <a
                href="https://t.me/zk_x402"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-subtle border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/5 hover:border-white/30 transition-all duration-300"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#D3447C]" />
                <span className="text-sm font-medium text-white">(zk_x402)</span>
              </a>
            </div>

            <div className="text-gray-400 text-sm text-center md:text-left">© 2025 ZK-X402. All rights reserved.</div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="glass-subtle border border-white/20 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/5 hover:border-white/30 transition-all duration-300 group"
              aria-label="Back to top"
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}
