import { JsonRpcProvider } from 'ethers'

export function getProvider(rpc) {
  return new JsonRpcProvider(rpc)
}
