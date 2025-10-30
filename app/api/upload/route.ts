export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { uploadFile, validateFile } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const contentType = formData.get("contentType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!contentType) {
      return NextResponse.json({ error: "Content type required" }, { status: 400 })
    }

    const validationError = validateFile(file, contentType)
    if (validationError) {
      return NextResponse.json({ error: validationError.error }, { status: 400 })
    }

    // Upload file with validation
    const result = await uploadFile(file, contentType)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("[v0] Error uploading file:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 },
    )
  }
}
