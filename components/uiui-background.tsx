"use client"

import { useEffect, useState } from "react"

export function UiuiBackground() {
  const [lines, setLines] = useState<Array<{ id: number; top: string; delay: string }>>([])
  const [verticalLines, setVerticalLines] = useState<Array<{ id: number; left: string; delay: string }>>([])

  useEffect(() => {
    // Generate horizontal gradient lines
    const horizontalLines = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      top: `${i * 12.5}%`,
      delay: `${i * 2}s`,
    }))

    // Generate vertical gradient lines
    const vLines = Array.from({ length: 8 }, (_, i) => ({
      id: i + 100,
      left: `${i * 12.5}%`,
      delay: `${i * 2}s`,
    }))

    setLines(horizontalLines)
    setVerticalLines(vLines)
  }, [])

  return (
    <>
      {/* Mesh Gradient Background */}
      <div className="mesh-gradient" />

      {/* Noise Texture */}
      <div className="noise-texture" />

      {/* Animated Gradient Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {lines.map((line) => (
          <div
            key={line.id}
            className="gradient-line"
            style={{
              top: line.top,
              width: "200%",
              animationDelay: line.delay,
            }}
          />
        ))}

        {verticalLines.map((line) => (
          <div
            key={line.id}
            className="gradient-line-vertical"
            style={{
              left: line.left,
              height: "200%",
              animationDelay: line.delay,
            }}
          />
        ))}
      </div>
    </>
  )
}
