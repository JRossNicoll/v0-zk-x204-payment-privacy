export const NETWORK_CONFIG = {
  chainId: 56, // BSC mainnet
  chainName: "BNB Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: ["https://bsc-dataseed.bnbchain.org"],
  blockExplorerUrls: ["https://bscscan.com"],
}

export const RELAYER_ADDRESS = process.env.RELAYER_ADDRESS || ""
export const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS || ""
export const PLATFORM_FEE_PERCENTAGE = 2.5 // 2.5% platform fee
