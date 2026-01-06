export const CHAINS = {
  amoy: {
    name: 'Polygon Amoy',
    chainId: 80002,
    rpc: process.env.POLYGON_AMOY_RPC,
    usdc: '0xaB54c4eaa445916882Ef47F1159B4488d2442045',
  },
  eth_sepolia: {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    rpc: process.env.SEPOLIA_RPC,
    usdc: '0x1B5336949072F738D31Bc650B7723DAcc0bb3659',
  },
  arbitrum_sepolia: {
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    rpc: process.env.ARBITRUM_SEPOLIA_RPC,
    usdc: '0xaB54c4eaa445916882Ef47F1159B4488d2442045',
  },
}
