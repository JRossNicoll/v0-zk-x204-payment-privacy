-- ZK-X402 Database Schema
-- This script creates the core tables for the paywall platform

-- Sellers table: stores seller/merchant information
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table: stores content metadata and pricing
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  merchant_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(18, 8) NOT NULL, -- ETH amount
  content_type TEXT NOT NULL, -- 'text', 'file', 'image', 'api', 'video'
  content_data TEXT, -- For text content or API URLs
  file_path TEXT, -- For uploaded files (Blob storage path)
  file_name TEXT, -- Original filename
  file_size INTEGER, -- File size in bytes
  mime_type TEXT, -- MIME type for files
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table: stores payment records
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  tx_hash TEXT UNIQUE NOT NULL,
  buyer_address TEXT NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  attestation TEXT, -- JWT attestation from relayer
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_seller_id ON content(seller_id);
CREATE INDEX IF NOT EXISTS idx_content_is_active ON content(is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_content_id ON transactions(content_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_address ON transactions(buyer_address);
CREATE INDEX IF NOT EXISTS idx_sellers_wallet_address ON sellers(wallet_address);

-- Add updated_at trigger for content table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
