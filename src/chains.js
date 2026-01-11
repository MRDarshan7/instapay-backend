export const CHAINS = [
  {
    key: "amoy",
    name: "Polygon Amoy",
    chainId: 80002,
    rpc: process.env.POLYGON_AMOY_RPC,
    usdc: "0xaB54c4eaa445916882Ef47F1159B4488d2442045"
  },

  {
    key: "sepolia",
    name: "Ethereum Sepolia",
    chainId: 11155111,
    rpc: process.env.SEPOLIA_RPC,
    usdc: "0x1B5336949072F738D31Bc650B7723DAcc0bb3659"
  },

  {
    key: "arb-sepolia",
    name: "Arbitrum Sepolia",
    chainId: 421614,
    rpc: process.env.ARBITRUM_SEPOLIA_RPC,
    usdc: "0xaB54c4eaa445916882Ef47F1159B4488d2442045"
  },

  {
    key: "shardeum",
    name: "Shardeum EVM Testnet",
    chainId: 8119,
    rpc: process.env.SHARDEUM_RPC,
    usdc: "0x1D782Be54c51c95c60088Ea8f7069b51F8E84142", 
  }
];
