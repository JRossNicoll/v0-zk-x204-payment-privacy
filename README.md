# ZK-X204 Platform

A complete paywall platform using the x402 HTTP payment protocol on BASE mainnet. Sellers can create and monetize protected content, while buyers can pay with crypto to access it instantly.

## Overview

ZK-X204 is a production-ready implementation of the x402 protocol featuring:
- **x402 Protocol**: Standard HTTP 402 Payment Required responses
- **PayAI Facilitator**: Payment verification and settlement via https://facilitator.payai.network
- **BASE Mainnet**: Fast, low-cost transactions on Coinbase's L2
- **Multi-Content Support**: Text, images, videos, files, and API access
- **Seller Dashboard**: Easy content creation and management
- **Instant Payments**: USDC payments with automatic verification

## Architecture

\`\`\`
Buyer → x402 Request → Server (402 Response)
  ↓
Payment (MetaMask) → BASE Mainnet
  ↓
X-PAYMENT Header → PayAI Facilitator → Verification
  ↓
Content Delivery
\`\`\`

1. Buyer requests protected content (receives 402 with payment requirements)
2. Buyer pays via MetaMask to merchant address
3. Payment authorization sent in X-PAYMENT header
4. PayAI facilitator verifies payment on BASE mainnet
5. Content delivered after verification

## Setup

### Prerequisites

- Node.js 18+
- MetaMask or Web3 wallet
- BASE mainnet ETH for gas fees
- USDC on BASE for payments (optional)

### Environment Variables

The following environment variables are already configured in your project:

\`\`\`bash
# Database (Neon)
NEON_NEON_DATABASE_URL=postgresql://...

# Relayer Configuration
RELAYER_PRIVATE_KEY=0x...
RELAYER_ADDRESS=0x...
MERCHANT_ADDRESS=0x...

# JWT for attestations
JWT_SECRET=your-secret-key

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=...

# RPC
ALCHEMY_RPC_URL=https://base-mainnet.g.alchemy.com/v2/...
\`\`\`

### Installation

\`\`\`bash
# Install dependencies
npm install

# Initialize database tables
npm run init-db

# Run the Next.js app
npm run dev
\`\`\`

## Usage

### For Sellers

1. **Access Seller Dashboard**
   - Visit http://localhost:3000
   - Click "Sell Protected Content"

2. **Create Content**
   - Connect your wallet (this becomes your merchant address)
   - Follow the 4-step wizard:
     - Step 1: Connect wallet
     - Step 2: Enter title, description, and price
     - Step 3: Upload/enter content (text, file, image, video, or API)
     - Step 4: Review and publish

3. **Share Paywall Link**
   - Copy the generated link (e.g., `/pay/abc123`)
   - Share with buyers
   - Track purchases in your dashboard

### For Buyers

1. **Visit Paywall Link**
   - Open the link shared by the seller
   - View content preview and price

2. **Connect Wallet & Pay**
   - Click "Connect Wallet"
   - Click "Pay X ETH"
   - Confirm transaction in MetaMask

3. **Access Content**
   - Payment verified via x402 protocol
   - Content unlocked automatically
   - Download/view based on content type

## API Reference

### GET /api/content/[contentId]/x402

x402-compliant endpoint for protected content.

**Without Payment (402 Response):**
\`\`\`json
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [{
    "scheme": "exact",
    "network": "base",
    "maxAmountRequired": "10000000",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x...",
    "resource": "https://yoursite.com/api/content/abc123/deliver",
    "description": "Premium content",
    "maxTimeoutSeconds": 300
  }]
}
\`\`\`

**With Payment (200 Response):**
\`\`\`json
{
  "success": true,
  "content": {
    "id": "abc123",
    "title": "Premium Content",
    "contentType": "text",
    "data": "..."
  },
  "txHash": "0x..."
}
\`\`\`

### POST /api/seller/content

Create new protected content.

**Request:**
\`\`\`json
{
  "title": "My Premium Content",
  "description": "Exclusive content",
  "price": "0.01",
  "contentType": "text",
  "contentData": "Secret content here",
  "merchantAddress": "0x...",
  "sellerWallet": "0x..."
}
\`\`\`

## x402 Protocol Integration

ZK-X204 implements the full x402 protocol specification:

### Payment Flow

1. **Initial Request**: Client requests resource without payment
2. **402 Response**: Server returns payment requirements
3. **Payment**: Client sends payment on BASE mainnet
4. **Authorization**: Client includes X-PAYMENT header with payment proof
5. **Verification**: PayAI facilitator verifies payment
6. **Delivery**: Server delivers content

### X-PAYMENT Header Format

\`\`\`typescript
{
  "x402Version": 1,
  "scheme": "exact",
  "network": "base",
  "payload": {
    "txHash": "0x...",
    "signature": "0x...",
    "authorization": {
      "from": "0x...",
      "to": "0x...",
      "value": "10000000",
      "validAfter": "1234567890",
      "validBefore": "1234567890",
      "nonce": "..."
    }
  }
}
\`\`\`

### PayAI Facilitator

- **URL**: https://facilitator.payai.network
- **Network**: BASE mainnet (`base`)
- **Endpoints**: `/verify`, `/settle`, `/list`
- **Token**: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)

## Database Schema

### Tables

**sellers**
- `id` (UUID, primary key)
- `wallet_address` (TEXT, unique)
- `email` (TEXT, optional)
- `created_at` (TIMESTAMP)

**content**
- `id` (UUID, primary key)
- `seller_id` (UUID, foreign key)
- `merchant_addr` (TEXT)
- `title` (TEXT)
- `description` (TEXT)
- `price` (DECIMAL)
- `content_type` (TEXT)
- `content_data` (TEXT)
- `file_path` (TEXT)
- `created_at` (TIMESTAMP)

**transactions**
- `id` (UUID, primary key)
- `content_id` (UUID, foreign key)
- `tx_hash` (TEXT, unique)
- `buyer_address` (TEXT)
- `amount` (DECIMAL)
- `attestation` (TEXT)
- `status` (TEXT)
- `timestamp` (TIMESTAMP)

**content_access_log**
- `id` (UUID, primary key)
- `content_id` (UUID, foreign key)
- `buyer_address` (TEXT)
- `tx_hash` (TEXT)
- `accessed_at` (TIMESTAMP)

## Technology Stack

- **Next.js 16**: App router with Turbopack
- **x402 Protocol**: Standard HTTP payment protocol
- **PayAI**: Facilitator for payment verification
- **BASE Mainnet**: Coinbase L2 (Chain ID: 8453)
- **Viem**: Ethereum library
- **Neon**: PostgreSQL database
- **Vercel Blob**: File storage
- **TypeScript**: Type-safe development

## Security Considerations

### Production Checklist

- ✅ HTTPS only in production
- ✅ Environment variables secured
- ✅ Database with proper indexes
- ✅ Rate limiting on API endpoints
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ JWT secret rotation
- ✅ Transaction verification on-chain
- ✅ File upload size limits
- ✅ Content access logging

### Payment Security

- All payments verified on BASE mainnet
- PayAI facilitator handles verification
- Transaction hashes stored for audit
- Attestations expire after 5 minutes
- Replay protection via nonces

## Troubleshooting

### Database Issues

Run the initialization script:
\`\`\`bash
npm run init-db
\`\`\`

### Payment Not Verifying

- Ensure wallet is connected to BASE mainnet
- Check transaction confirmed on basescan.org
- Verify sufficient ETH for gas fees
- Check PayAI facilitator status

### Content Not Uploading

- Check file size limits (10MB max)
- Verify BLOB_READ_WRITE_TOKEN is set
- Check file type is supported
- Review browser console for errors

## Resources

- [x402 Protocol](https://x402.org)
- [PayAI Documentation](https://docs.payai.network)
- [BASE Network](https://base.org)
- [Viem Documentation](https://viem.sh)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

## License

MIT
