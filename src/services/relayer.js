import { Wallet } from 'ethers'
import { RELAYER_PK } from '../config.js'

export function getRelayer(provider) {
  return new Wallet(RELAYER_PK, provider)
}
