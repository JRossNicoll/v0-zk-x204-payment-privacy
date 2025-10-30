// Database utility functions for ZK-X402
import { neon } from "@neondatabase/serverless"

// Get database connection
export function getDb() {
  const dbUrl = process.env.NEON_NEON_DATABASE_URL || process.env.NEON_POSTGRES_URL || process.env.DATABASE_URL

  if (!dbUrl) {
    console.error("[v0] Database URL not found. Available env vars:", {
      hasNeonDb: !!process.env.NEON_DATABASE_URL,
      hasNeonPostgres: !!process.env.NEON_POSTGRES_URL,
      hasDatabase: !!process.env.DATABASE_URL,
    })
    throw new Error("Database URL environment variable is not set")
  }

  console.log("[v0] Database connection established")
  return neon(dbUrl)
}

// Seller operations
export async function createSeller(walletAddress: string, email?: string) {
  const sql = getDb()
  const result = await sql`
    INSERT INTO sellers (wallet_address, email)
    VALUES (${walletAddress}, ${email})
    ON CONFLICT (wallet_address) DO UPDATE SET email = ${email}
    RETURNING *
  `
  return result[0]
}

export async function getSellerByWallet(walletAddress: string) {
  const sql = getDb()
  const result = await sql`
    SELECT * FROM sellers WHERE wallet_address = ${walletAddress}
  `
  return result[0]
}

// Content operations
export async function createContent(data: {
  sellerId: string
  merchantAddress: string
  title: string
  description?: string
  price: string
  contentType: string
  contentData?: string
  filePath?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
}) {
  const sql = getDb()
  const result = await sql`
    INSERT INTO content (
      seller_id, merchant_address, title, description, price,
      content_type, content_data, file_path, file_name, file_size, mime_type
    )
    VALUES (
      ${data.sellerId}, ${data.merchantAddress}, ${data.title}, ${data.description || null},
      ${data.price}, ${data.contentType}, ${data.contentData || null}, ${data.filePath || null},
      ${data.fileName || null}, ${data.fileSize || null}, ${data.mimeType || null}
    )
    RETURNING *
  `
  return result[0]
}

export async function getContentById(contentId: string) {
  const sql = getDb()
  const result = await sql`
    SELECT c.*, s.wallet_address as seller_wallet
    FROM content c
    JOIN sellers s ON c.seller_id = s.id
    WHERE c.id = ${contentId} AND c.is_active = true
  `
  return result[0]
}

export async function getContentBySeller(sellerId: string) {
  const sql = getDb()
  return await sql`
    SELECT * FROM content
    WHERE seller_id = ${sellerId}
    ORDER BY created_at DESC
  `
}

export async function updateContent(
  contentId: string,
  data: {
    title?: string
    description?: string
    price?: string
    isActive?: boolean
  },
) {
  const sql = getDb()
  const updates: string[] = []
  const values: any[] = []

  if (data.title !== undefined) {
    updates.push(`title = $${updates.length + 1}`)
    values.push(data.title)
  }
  if (data.description !== undefined) {
    updates.push(`description = $${updates.length + 1}`)
    values.push(data.description)
  }
  if (data.price !== undefined) {
    updates.push(`price = $${updates.length + 1}`)
    values.push(data.price)
  }
  if (data.isActive !== undefined) {
    updates.push(`is_active = $${updates.length + 1}`)
    values.push(data.isActive)
  }

  if (updates.length === 0) return null

  const result = await sql`
    UPDATE content
    SET ${sql(updates.join(", "))}
    WHERE id = ${contentId}
    RETURNING *
  `
  return result[0]
}

// Content access logging
export async function logContentAccess(data: {
  contentId: string
  buyerAddress: string
  txHash: string
  accessedAt?: Date
}) {
  const sql = getDb()
  const result = await sql`
    INSERT INTO content_access_log (content_id, buyer_address, tx_hash, accessed_at)
    VALUES (
      ${data.contentId}, ${data.buyerAddress}, ${data.txHash},
      ${data.accessedAt || new Date()}
    )
    RETURNING *
  `
  return result[0]
}

export async function getContentAccessLog(contentId: string) {
  const sql = getDb()
  return await sql`
    SELECT * FROM content_access_log
    WHERE content_id = ${contentId}
    ORDER BY accessed_at DESC
  `
}

// Verify if buyer has paid for content
export async function verifyContentAccess(contentId: string, buyerAddress: string): Promise<boolean> {
  const sql = getDb()
  const result = await sql`
    SELECT COUNT(*) as count FROM transactions
    WHERE content_id = ${contentId}
      AND buyer_address = ${buyerAddress}
      AND status = 'confirmed'
  `
  return result[0]?.count > 0
}

// Get content with seller info
export async function getContentWithSeller(contentId: string) {
  const sql = getDb()
  const result = await sql`
    SELECT 
      c.*,
      s.wallet_address as seller_wallet,
      s.email as seller_email
    FROM content c
    JOIN sellers s ON c.seller_id = s.id
    WHERE c.id = ${contentId} AND c.is_active = true
  `
  return result[0]
}

// Transaction operations
export async function createTransaction(data: {
  contentId: string
  txHash: string
  buyerAddress: string
  amount: string
  attestation?: string
  status?: string
}) {
  const sql = getDb()
  const result = await sql`
    INSERT INTO transactions (
      content_id, tx_hash, buyer_address, amount, attestation, status
    )
    VALUES (
      ${data.contentId}, ${data.txHash}, ${data.buyerAddress},
      ${data.amount}, ${data.attestation || null}, ${data.status || "pending"}
    )
    ON CONFLICT (tx_hash) DO UPDATE
    SET attestation = ${data.attestation || null}, status = ${data.status || "pending"}
    RETURNING *
  `
  return result[0]
}

export async function getTransactionByHash(txHash: string) {
  const sql = getDb()
  const result = await sql`
    SELECT * FROM transactions WHERE tx_hash = ${txHash}
  `
  return result[0]
}

export async function getTransactionsByContent(contentId: string) {
  const sql = getDb()
  return await sql`
    SELECT * FROM transactions
    WHERE content_id = ${contentId}
    ORDER BY created_at DESC
  `
}

export async function updateTransactionStatus(txHash: string, status: string, attestation?: string) {
  const sql = getDb()
  const result = await sql`
    UPDATE transactions
    SET status = ${status}, attestation = ${attestation || null}
    WHERE tx_hash = ${txHash}
    RETURNING *
  `
  return result[0]
}
