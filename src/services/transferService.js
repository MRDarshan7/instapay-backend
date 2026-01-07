import { ethers } from "ethers";
import MockUSDC_ABI from "../abi/MockUSDC.js";
import { CHAINS } from "../chains.js";
import { encryptValue, decryptValue } from "./incoService.js";

export async function sendMockUSDC({ recipient, amount }) {
  // 1️⃣ Random chain (testnet demo)
  const chain = CHAINS[Math.floor(Math.random() * CHAINS.length)];

  // 2️⃣ Encrypt amount using Inco
  const ciphertext = await encryptValue({
    value: Number(amount),
    accountAddress: process.env.BACKEND_WALLET_ADDRESS,
    dappAddress: chain.usdc,
    chainId: chain.chainId,
    rpc: chain.rpc,
    relayerPk: process.env.RELAYER_PK,
  });

  // 3️⃣ Demo-only decrypt (backend-side)
  const decryptedAmount = await decryptValue({
    handle: ciphertext.handle,
    chainId: chain.chainId,
    rpc: chain.rpc,
    relayerPk: process.env.RELAYER_PK,
  });

  // 4️⃣ Provider + relayer wallet
  const provider = new ethers.JsonRpcProvider(chain.rpc);
  const wallet = new ethers.Wallet(process.env.RELAYER_PK, provider);

  // 5️⃣ Contract
  const contract = new ethers.Contract(
    chain.usdc,
    MockUSDC_ABI,
    wallet
  );

  const decimals = await contract.decimals();
  const parsedAmount = ethers.parseUnits(
    decryptedAmount.toString(),
    decimals
  );

  // 6️⃣ Send tx (relayer pays gas)
  const tx = await contract.transfer(recipient, parsedAmount);
  const receipt = await tx.wait();

  return {
    success: true,
    network: chain.name,
    chainId: chain.chainId,
    txHash: receipt.hash,
    encrypted: true
  };
}
