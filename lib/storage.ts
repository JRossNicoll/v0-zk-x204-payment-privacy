// Content storage utilities for ZK-X402
import { put, del, head } from "@vercel/blob"

// File size limits (in bytes)
const MAX_FILE_SIZE = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  file: 50 * 1024 * 1024, // 50MB
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  file: [
    "application/pdf",
    "application/zip",
    "application/json",
    "text/plain",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
}

export interface UploadResult {
  url: string
  fileName: string
  size: number
  mimeType: string
}

export interface ValidationError {
  error: string
  code: "FILE_TOO_LARGE" | "INVALID_TYPE" | "INVALID_FILE"
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, contentType: string): ValidationError | null {
  // Check file size
  const maxSize = MAX_FILE_SIZE[contentType as keyof typeof MAX_FILE_SIZE]
  if (maxSize && file.size > maxSize) {
    return {
      error: `File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
      code: "FILE_TOO_LARGE",
    }
  }

  // Check MIME type
  const allowedTypes = ALLOWED_MIME_TYPES[contentType as keyof typeof ALLOWED_MIME_TYPES]
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
      code: "INVALID_TYPE",
    }
  }

  return null
}

/**
 * Upload file to Vercel Blob storage
 */
export async function uploadFile(file: File, contentType: string): Promise<UploadResult> {
  // Validate file
  const validationError = validateFile(file, contentType)
  if (validationError) {
    throw new Error(validationError.error)
  }

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(7)
  const extension = file.name.split(".").pop()
  const uniqueFileName = `${contentType}/${timestamp}-${randomString}.${extension}`

  // Upload to Blob
  const blob = await put(uniqueFileName, file, {
    access: "public",
    addRandomSuffix: false,
  })

  return {
    url: blob.url,
    fileName: file.name,
    size: file.size,
    mimeType: file.type,
  }
}

/**
 * Delete file from Vercel Blob storage
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    console.error("[v0] Error deleting file:", error)
    throw new Error("Failed to delete file")
  }
}

/**
 * Check if file exists in Blob storage
 */
export async function fileExists(url: string): Promise<boolean> {
  try {
    await head(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get file metadata from Blob storage
 */
export async function getFileMetadata(url: string) {
  try {
    const metadata = await head(url)
    return {
      size: metadata.size,
      uploadedAt: metadata.uploadedAt,
      contentType: metadata.contentType,
    }
  } catch (error) {
    console.error("[v0] Error getting file metadata:", error)
    return null
  }
}
