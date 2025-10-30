/**
 * Database Initialization Script
 * Run this script to create all necessary tables for ZK-X402
 *
 * Usage: Run this script from the Scripts section in v0
 */

import { neon } from "@neondatabase/serverless"

async function initDatabase() {
  console.log("[v0] Starting database initialization...")

  const databaseUrl = process.env.NEON_NEON_NEON_DATABASE_URL || process.env.NEON_NEON_DATABASE_URL
  if (!databaseUrl) {
    throw new Error("Database URL not found in environment variables")
  }
  const sql = neon(databaseUrl)

  try {
    console.log("[v0] Creating core tables (sellers, content, transactions)...")

    await sql`
      -- Create sellers table
      CREATE TABLE IF NOT EXISTS sellers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_address VARCHAR(42) UNIQUE NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create content table
      CREATE TABLE IF NOT EXISTS content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        merchant_address VARCHAR(42) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(50) NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        content_data TEXT,
        file_path TEXT,
        file_name VARCHAR(255),
        file_size INTEGER,
        mime_type VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create transactions table
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
        tx_hash VARCHAR(66) UNIQUE NOT NULL,
        buyer_address VARCHAR(42) NOT NULL,
        amount VARCHAR(50) NOT NULL,
        attestation TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_content_seller ON content(seller_id);
      CREATE INDEX IF NOT EXISTS idx_content_merchant ON content(merchant_address);
      CREATE INDEX IF NOT EXISTS idx_transactions_content ON transactions(content_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_address);
      CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(tx_hash);

      -- Create trigger for updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `

    console.log("[v0] ✓ Core tables created successfully")

    console.log("[v0] Creating access log table...")

    await sql`
      -- Create content access log table
      CREATE TABLE IF NOT EXISTS content_access_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
        buyer_address VARCHAR(42) NOT NULL,
        tx_hash VARCHAR(66) NOT NULL,
        accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create index for access log
      CREATE INDEX IF NOT EXISTS idx_access_log_content ON content_access_log(content_id);
      CREATE INDEX IF NOT EXISTS idx_access_log_buyer ON content_access_log(buyer_address);
    `

    console.log("[v0] ✓ Access log table created successfully")

    // Verify tables were created
    console.log("[v0] Verifying database setup...")
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sellers', 'content', 'transactions', 'content_access_log')
      ORDER BY table_name
    `

    console.log("[v0] Database tables found:", tables.map((t) => t.table_name).join(", "))

    if (tables.length === 4) {
      console.log("[v0] ✅ Database initialization complete! All tables created successfully.")
      console.log("[v0] You can now use the seller dashboard to create content.")
    } else {
      console.log("[v0] ⚠️ Warning: Expected 4 tables but found", tables.length)
    }
  } catch (error) {
    console.error("[v0] ❌ Database initialization failed:", error)
    throw error
  }
}

// Run the initialization
initDatabase()
  .then(() => {
    console.log("[v0] Script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Script failed:", error)
    process.exit(1)
  })
