"use client"

import { useEffect } from "react"

export function CursorGlow() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const glow = document.getElementById("cursor-glow")
      if (glow) {
        glow.style.left = `${e.clientX}px`
        glow.style.top = `${e.clientY}px`
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      id="cursor-glow"
      className="pointer-events-none fixed w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl transition-opacity duration-300"
      style={{
        background: "radial-gradient(circle, rgba(194,178,80,0.15) 0%, rgba(211,68,124,0.1) 50%, transparent 70%)",
        zIndex: 9999,
      }}
    />
  )
}
