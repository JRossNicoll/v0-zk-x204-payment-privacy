-- Add content access logging table
CREATE TABLE IF NOT EXISTS content_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  buyer_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_access_log_content_id ON content_access_log(content_id);
CREATE INDEX IF NOT EXISTS idx_access_log_buyer_address ON content_access_log(buyer_address);
CREATE INDEX IF NOT EXISTS idx_access_log_tx_hash ON content_access_log(tx_hash);
