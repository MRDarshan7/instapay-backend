import { Contract } from 'ethers'
import { CHAINS } from '../chains.js'
import { BACKEND_WALLET } from '../config.js'
import { getProvider } from './provider.js'
import { getRelayer } from './relayer.js'
import USDC_ABI from '../abi/MockUSDC.json' assert { type: 'json' }

export async function executeTransfer({ recipient, amount }) {
  // 🧪 RANDOM network selection (TESTNET MODE)
  const entries = Object.entries(CHAINS)
  const randomIndex = Math.floor(Math.random() * entries.length)
  const [chainKey, chain] = entries[randomIndex]

  console.log(`🧪 Selected network: ${chain.name}`)

  const provider = getProvider(chain.rpc)
  const relayer = getRelayer(provider)

  const usdc = new Contract(
    chain.usdc,
    USDC_ABI,
    relayer
  )

  const balance = await usdc.balanceOf(BACKEND_WALLET)

  if (balance < BigInt(amount)) {
    throw new Error(`Insufficient USDC on ${chain.name}`)
  }

  const tx = await usdc.transfer(recipient, amount)
  const receipt = await tx.wait()

  return {
    success: true,
    network: chain.name,
    txHash: receipt.hash,
  }
}
