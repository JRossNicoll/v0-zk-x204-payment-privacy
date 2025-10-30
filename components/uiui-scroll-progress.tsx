"use client"

import { useEffect, useState } from "react"

export function UiuiScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setProgress(scrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C2B250] via-[#D3447C] to-[#6B5391] origin-left z-50 transition-transform duration-150"
      style={{ transform: `scaleX(${progress / 100})` }}
    />
  )
}
