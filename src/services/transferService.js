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

export async function sendMockUSDC({ sender, recipient, amount }) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  // Pick a random chain each attempt
  //const chain = CHAINS[Math.floor(Math.random() * CHAINS.length)];
  const chain = CHAINS.find(c => c.key === "sepolia"); //Sepolia only
  console.log("Randomly selected chain:", chain.name);

  //ALOGORITHM FOR CHEAPEST CHAIN
  // async function pickCheapestChain(amount) {
  // let best = null;

  // for (const chain of CHAINS) {
  //   try {
  //     const provider = new ethers.JsonRpcProvider(chain.rpc);
  //     const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
  //     const contract = new ethers.Contract(chain.usdc, MockUSDC_ABI, wallet);

  //     const decimals = await contract.decimals();
  //     const parsed = ethers.parseUnits(amount, decimals);

  //     const gas = await contract.transfer.estimateGas(
  //       wallet.address,
  //       parsed
  //     );

  //     const gasPrice = await provider.getGasPrice();
  //     const cost = gas * gasPrice;

  //     if (!best || cost < best.cost) {
  //       best = { chain, cost };
  //     }
  //   } catch (_) {}
  // }

  // if (!best) throw new Error("No viable chain");
  // return best.chain;
  // }

  //const chain = await pickCheapestChain(amount);

    try {
      const provider = new ethers.JsonRpcProvider(chain.rpc);

      //const wallet = new ethers.Wallet(process.env.RELAYER_PK, provider); //CORRECTED VARIABLE
      const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

      console.log("Relayer address:", wallet.address);

      const contract = new ethers.Contract(
        chain.usdc,
        MockUSDC_ABI,
        wallet
      );

      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);
      
      const allowance = await contract.allowance(sender, wallet.address);

      if (allowance < parsedAmount) {
        throw new Error("Insufficient USDC allowance");
      }


      const tx = await contract.transferFrom(
                sender,      // user wallet
                recipient,   // receiver
                parsedAmount
              );
      

      console.log("TX SENT:", tx.hash);//CAN BE REMOVED(DEBUGGING)


      const receipt = await tx.wait();

      
      console.log("TX CONFIRMED");
      console.log("Block number:", receipt.blockNumber);
      console.log("Chain ID:", (await provider.getNetwork()).chainId);
      const onChainReceipt = await provider.getTransactionReceipt(tx.hash);
      console.log("On-chain receipt exists:", !!onChainReceipt);


      // ✅ Success → return immediately
      // return {
      //   success: true,
      //   network: chain.name,
      //   chainId: chain.chainId,
      //   txHash: receipt.hash,
      //   attempts: attempt
      // };
      
      //TEMP
      return {
        success: true,
        network: chain.name,
        chainId: chain.chainId,
        txHash: receipt.hash,
        etherscanTx: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
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
