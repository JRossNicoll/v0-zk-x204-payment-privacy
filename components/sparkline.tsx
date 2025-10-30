"use client"

import { useEffect, useRef } from "react"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  type?: "line" | "bar"
}

export function Sparkline({ data, width = 120, height = 40, color = "#3b82f6", type = "line" }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (data.length === 0) return

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    if (type === "bar") {
      const barWidth = width / data.length
      ctx.fillStyle = color + "40" // 25% opacity

      data.forEach((value, i) => {
        const barHeight = ((value - min) / range) * height
        const x = i * barWidth
        const y = height - barHeight
        ctx.fillRect(x, y, barWidth * 0.8, barHeight)
      })
    } else {
      // Line chart
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      data.forEach((value, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((value - min) / range) * height

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Fill area under line
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()
      ctx.fillStyle = color + "20" // 12% opacity
      ctx.fill()
    }
  }, [data, width, height, color, type])

  return <canvas ref={canvasRef} width={width} height={height} className="w-full h-auto" />
}
