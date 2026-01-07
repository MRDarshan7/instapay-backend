import { ethers } from "ethers";
import MockUSDC_ABI from "../abi/MockUSDC.js";
import { CHAINS } from "../chains.js";

const MAX_RETRIES = 3;

function isRetryableError(err) {
  const msg = err?.message || "";
  return (
    msg.includes("522") ||
    msg.includes("timeout") ||
    msg.includes("SERVER_ERROR") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("failed to fetch")
  );
}

export async function sendMockUSDC({ recipient, amount }) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // Pick a random chain each attempt
    const chain = CHAINS[Math.floor(Math.random() * CHAINS.length)];

    try {
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

      // ✅ Success → return immediately
      return {
        success: true,
        network: chain.name,
        chainId: chain.chainId,
        txHash: receipt.hash,
        attempts: attempt
      };

    } catch (err) {
      lastError = err;

      console.error(
        `Transfer attempt ${attempt} failed on ${chain.name}:`,
        err.message
      );

      // ❌ Non-retryable errors should fail fast
      if (!isRetryableError(err)) {
        throw err;
      }

      // 🔁 Retry on next loop iteration
    }
  }

  // ❌ All retries exhausted
  throw new Error(
    `Transfer failed after ${MAX_RETRIES} attempts: ${lastError?.message}`
  );
}
