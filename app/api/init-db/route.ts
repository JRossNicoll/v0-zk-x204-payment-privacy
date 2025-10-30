import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("[v0] Initializing database...")

    const dbUrl =
      process.env.NEON_NEON_DATABASE_URL ||
      process.env.NEON_NEON_DATABASE_URL ||
      process.env.NEON_NEON_NEON_DATABASE_URL

    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    const sql = neon(dbUrl)

    // Check if tables already exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sellers', 'content', 'transactions', 'content_access_log')
    `

    if (tables.length === 4) {
      console.log("[v0] Database tables already exist, dropping and recreating...")
      // Drop tables to recreate with correct schema
      await sql`DROP TABLE IF EXISTS content_access_log CASCADE`
      await sql`DROP TABLE IF EXISTS transactions CASCADE`
      await sql`DROP TABLE IF EXISTS content CASCADE`
      await sql`DROP TABLE IF EXISTS sellers CASCADE`
    }

    console.log("[v0] Creating database tables...")

    await sql`
      CREATE TABLE IF NOT EXISTS sellers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_address TEXT UNIQUE NOT NULL,
        email TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
        merchant_address TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price DECIMAL(18, 8) NOT NULL,
        content_type TEXT NOT NULL,
        content_data TEXT,
        file_path TEXT,
        file_name TEXT,
        file_size INTEGER,
        mime_type TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_id UUID REFERENCES content(id) ON DELETE CASCADE,
        buyer_address TEXT NOT NULL,
        tx_hash TEXT UNIQUE NOT NULL,
        amount DECIMAL(18, 8) NOT NULL,
        attestation TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS content_access_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_id UUID REFERENCES content(id) ON DELETE CASCADE,
        buyer_address TEXT NOT NULL,
        tx_hash TEXT,
        accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_content_seller ON content(seller_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_content_is_active ON content(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_content ON transactions(content_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_address)`
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash)`
    await sql`CREATE INDEX IF NOT EXISTS idx_access_log_content ON content_access_log(content_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_sellers_wallet_address ON sellers(wallet_address)`

    console.log("[v0] Database tables created successfully")

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      tables: ["sellers", "content", "transactions", "content_access_log"],
    })
  } catch (error: any) {
    console.error("[v0] Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
