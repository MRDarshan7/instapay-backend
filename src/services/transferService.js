import { ethers } from "ethers";
import MockUSDC_ABI from "../abi/MockUSDC.js";
import { CHAINS } from "../chains.js";

export async function sendMockUSDC({ recipient, amount }) {
  // Random chain (testnet demo)
  const chain = CHAINS[Math.floor(Math.random() * CHAINS.length)];

  const provider = new ethers.JsonRpcProvider(chain.rpc);
  const wallet = new ethers.Wallet(process.env.RELAYER_PK, provider);

  const contract = new ethers.Contract(
    chain.usdc,
    MockUSDC_ABI,
    wallet
  );

  const decimals = await contract.decimals();
  const parsedAmount = ethers.parseUnits(amount, decimals);

  const tx = await contract.transfer(recipient, parsedAmount);
  const receipt = await tx.wait();

  return {
    success: true,
    network: chain.name,
    chainId: chain.chainId,
    txHash: receipt.hash
  };
}
