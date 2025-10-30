import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { Geist, Geist_Mono as GeistMono, Source_Serif_4 } from "next/font/google"

// Initialize fonts
const _geist = Geist({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })
const _geistMono = GeistMono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})
const _sourceSerif_4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})

const geist = Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "ZK-X402 | Privacy-Preserving Payment Protocol",
  description: "Privacy-preserving micropayment protocol demonstration",
  generator: "v0.app",
  icons: {
    icon: "/zk-logo.png",
    shortcut: "/zk-logo.png",
    apple: "/zk-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${geist.className}`}>{children}</body>
    </html>
  )
}
