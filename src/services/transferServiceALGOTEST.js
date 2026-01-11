// import "dotenv/config";
// import { ethers } from "ethers";
// import MockUSDC_ABI from "../abi/MockUSDC.js";
// import { CHAINS } from "../chains.js";

// const MAX_RETRIES = 3;

// function isRetryableError(err) {
//   const msg = err?.message || "";
//   return (
//     msg.includes("522") ||
//     msg.includes("timeout") ||
//     msg.includes("SERVER_ERROR") ||
//     msg.includes("ETIMEDOUT") ||
//     msg.includes("failed to fetch")
//   );
// }

// export async function sendMockUSDC({ recipient, amount }) {
//   let lastError = null;

//   for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//   // Pick a random chain each attempt
//   //const chain = CHAINS[Math.floor(Math.random() * CHAINS.length)];
//   //const chain = CHAINS.find(c => c.key === "sepolia"); Sepolia only


//   //ALOGORITHM FOR CHEAPEST CHAIN
//   async function pickCheapestChain() {
//     let cheapest = null;

//     for (const chain of CHAINS) {
//       try {
//         const provider = new ethers.JsonRpcProvider(chain.rpc);

//         const balance = await provider.getBalance(
//           process.env.RELAYER_ADDRESS
//         );

//         // 🔍 DEBUG — ADD EXACTLY HERE
//         const network = await provider.getNetwork();
//         console.log({
//           chain: chain.name,
//           rpcChainId: network.chainId.toString(),
//           expectedChainId: chain.chainId,
//           balance: ethers.formatEther(balance)
//         });
//         // 🔍 DEBUG — END

//         if (balance === 0n) continue;

//         const gasPrice = await provider.getGasPrice();
//         const estimatedGas = 100_000n;
//         const cost = gasPrice * estimatedGas;

//         if (!cheapest || cost < cheapest.cost) {
//           cheapest = { chain, cost };
//         }

//       } catch (err) {
//         console.error("RPC failed for", chain.name, err.message);
//         continue;
//       }
//     }

//     if (!cheapest) {
//       throw new Error("No viable chain found");
//     }

//     return cheapest.chain;
//   }



//   const chain = await pickCheapestChain();

//     try {
//       const provider = new ethers.JsonRpcProvider(chain.rpc);

//       //const wallet = new ethers.Wallet(process.env.RELAYER_PK, provider); //CORRECTED VARIABLE
//       const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

//       const contract = new ethers.Contract(
//         chain.usdc,
//         MockUSDC_ABI,
//         wallet
//       );

//       const decimals = await contract.decimals();
//       const parsedAmount = ethers.parseUnits(amount, decimals);

//       const tx = await contract.transfer(recipient, parsedAmount);
//       const receipt = await tx.wait();

//       // ✅ Success → return immediately
//       return {
//         success: true,
//         network: chain.name,
//         chainId: chain.chainId,
//         txHash: receipt.hash,
//         attempts: attempt
//       };

//     } catch (err) {
//       lastError = err;

//       console.error(
//         `Transfer attempt ${attempt} failed on ${chain.name}:`,
//         err.message
//       );

//       // ❌ Non-retryable errors should fail fast
//       if (!isRetryableError(err)) {
//         throw err;
//       }

//       // 🔁 Retry on next loop iteration
//     }
//   }

//   // ❌ All retries exhausted
//   throw new Error(
//     `Transfer failed after ${MAX_RETRIES} attempts: ${lastError?.message}`
//   );
// }

import "dotenv/config";
import { ethers } from "ethers";
import MockUSDC_ABI from "../abi/MockUSDC.js";
import { CHAINS } from "../chains.js";

const MAX_RETRIES = 3;

/**
 * Determines whether an error is retryable (RPC / network issues)
 */
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

/**
 * Picks the cheapest blockchain based on current gas prices.
 * NOTE: Relayer balance check is intentionally disabled for testnets
 * due to RPC inconsistencies. In production, this should be enforced.
 */
async function pickCheapestChain() {
  let cheapest = null;

  for (const chain of CHAINS) {
    try {
      const provider = new ethers.JsonRpcProvider(chain.rpc);

      const relayerAddress = ethers.getAddress(
        process.env.RELAYER_ADDRESS
      );

      const balance = await provider.getBalance(relayerAddress);

      const network = await provider.getNetwork();
      console.log({
        chain: chain.name,
        chainId: network.chainId.toString(),
        balance: ethers.formatEther(balance)
      });

      // (balance check optional on testnet)
      // if (balance === 0n) continue;

      const feeData = await provider.getFeeData();

      // Fallback safety (some testnets behave oddly)
      if (!feeData.gasPrice) {
        throw new Error("Gas price unavailable");
      }

      const gasPrice = feeData.gasPrice;
      const estimatedGas = 100_000n;
      const cost = gasPrice * estimatedGas;


      if (!cheapest || cost < cheapest.cost) {
        cheapest = { chain, cost };
      }

    } catch (err) {
      console.error("RPC failed for", chain.name, err.message);
    }
  }

  if (!cheapest) {
    throw new Error("No viable chain found");
  }

  return cheapest.chain;
}


/**
 * Sends Mock USDC using a gas-sponsored relayer
 */
export async function sendMockUSDC({ recipient, amount }) {
  let lastError = null;

  // Pick cheapest chain ONCE
  const chain = await pickCheapestChain();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      const wallet = new ethers.Wallet(
        process.env.RELAYER_PRIVATE_KEY,
        provider
      );

      const contract = new ethers.Contract(
        chain.usdc,
        MockUSDC_ABI,
        wallet
      );

      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await contract.transfer(recipient, parsedAmount);
      const receipt = await tx.wait();

      // ✅ Success
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

      if (!isRetryableError(err)) {
        throw err;
      }
    }
  }

  throw new Error(
    `Transfer failed after ${MAX_RETRIES} attempts: ${lastError?.message}`
  );
}
