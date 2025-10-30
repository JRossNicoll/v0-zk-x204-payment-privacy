"use client"

import { useEffect, useRef } from "react"

export function UiuiCursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`
        glowRef.current.style.top = `${e.clientY}px`
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      ref={glowRef}
      className="fixed pointer-events-none z-50 w-96 h-96 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
      style={{
        background:
          "radial-gradient(circle, rgba(194, 178, 80, 0.15) 0%, rgba(211, 68, 124, 0.1) 25%, transparent 50%)",
        filter: "blur(40px)",
      }}
    />
  )
}
