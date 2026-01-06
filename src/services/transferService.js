import { ethers } from "ethers";
import MockUSDC_ABI from "../abi/MockUSDC.js";
import { CHAINS } from "../chains.js";

export async function sendMockUSDC({ recipient, amount }) {
  // 1️⃣ Random chain (testnet demo)
  const chain = CHAINS[Math.floor(Math.random() * CHAINS.length)];

  // 2️⃣ Provider + relayer wallet
  const provider = new ethers.JsonRpcProvider(chain.rpc);
  const wallet = new ethers.Wallet(process.env.RELAYER_PK, provider);

  // 3️⃣ Contract
  const contract = new ethers.Contract(
    chain.usdc,
    MockUSDC_ABI,
    wallet
  );

  const decimals = await contract.decimals();
  const parsedAmount = ethers.parseUnits(amount, decimals);

  // 4️⃣ Send tx (relayer pays gas)
  const tx = await contract.transfer(recipient, parsedAmount);
  const receipt = await tx.wait();

  return {
    network: chain.name,
    chainId: chain.chainId,
    txHash: receipt.hash
  };
}
