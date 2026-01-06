require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ===================== CHAINS ===================== */
const CHAINS = {
  polygon: {
    name: "Polygon",
    chainId: 137,
    rpc: "https://polygon-rpc.com",
  },
  arbitrum: {
    name: "Arbitrum",
    chainId: 42161,
    rpc: "https://arb1.arbitrum.io/rpc",
  },
  avalanche: {
    name: "Avalanche",
    chainId: 43114,
    rpc: "https://api.avax.network/ext/bc/C/rpc",
  },
};

/* ===================== TOKENS ===================== */
const TOKENS = {
  USDC: {
    polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    avalanche: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  },
};

/* ===================== GAS PRICE ===================== */
async function getGasPrice(rpc) {
  const res = await axios.post(rpc, {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_gasPrice",
    params: [],
  });
  return BigInt(res.data.result);
}

/* ===================== CHEAPEST CHAIN ===================== */
async function getCheapestChain() {
  const GAS_LIMIT = 60000n;
  const results = [];

  for (const key of Object.keys(CHAINS)) {
    const gasPrice = await getGasPrice(CHAINS[key].rpc);
    const fee = gasPrice * GAS_LIMIT;

    results.push({
      chain: key,
      chainName: CHAINS[key].name,
      chainId: CHAINS[key].chainId,
      gasPrice,
      estimatedFee: fee,
    });
  }

  results.sort((a, b) =>
    a.estimatedFee < b.estimatedFee ? -1 : 1
  );

  return results[0];
}

/* ===================== GAS ESTIMATE API ===================== */
app.get("/gas-estimate", async (_, res) => {
  try {
    const cheapest = await getCheapestChain();
    res.json({
      chain: cheapest.chain,
      chainName: cheapest.chainName,
      chainId: cheapest.chainId,
      gasPrice: cheapest.gasPrice.toString(),
      estimatedFee: cheapest.estimatedFee.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gas estimation failed" });
  }
});

/* ===================== ROUTE + TX BUILDER ===================== */
app.post("/route-transfer", async (req, res) => {
  try {
    const { sender, recipient, token, amount } = req.body;

    if (!ethers.isAddress(sender))
      return res.status(400).json({ error: "Invalid sender" });

    if (!ethers.isAddress(recipient))
      return res.status(400).json({ error: "Invalid recipient" });

    if (!TOKENS[token])
      return res.status(400).json({ error: "Unsupported token" });

    if (!amount || Number(amount) <= 0)
      return res.status(400).json({ error: "Invalid amount" });

    // 1️⃣ Cheapest chain
    const cheapest = await getCheapestChain();
    const chain = cheapest.chain;

    // 2️⃣ Build ERC20 calldata
    const provider = new ethers.JsonRpcProvider(CHAINS[chain].rpc);

    const ERC20_ABI = [
      "function transfer(address to, uint256 amount)",
      "function decimals() view returns (uint8)",
    ];

    const contract = new ethers.Contract(
      TOKENS[token][chain],
      ERC20_ABI,
      provider
    );

    const decimals = await contract.decimals();
    const parsedAmount = ethers.parseUnits(amount, decimals);

    const iface = new ethers.Interface(ERC20_ABI);
    const data = iface.encodeFunctionData("transfer", [
      recipient,
      parsedAmount,
    ]);

    // 3️⃣ SAFE GAS VALUES (CRITICAL FIX)
    const gasLimit = 60000n;
    const maxPriorityFeePerGas = 1_000_000_000n; // 1 gwei

    res.json({
      route: {
        destinationChain: chain,
        chainName: CHAINS[chain].name,
        chainId: "0x" + CHAINS[chain].chainId.toString(16), // HEX for MetaMask
      },
      tx: {
        from: sender,
        to: TOKENS[token][chain],
        data,
        value: "0x0",
        gas: "0x" + gasLimit.toString(16),
        maxFeePerGas: "0x" + cheapest.gasPrice.toString(16),
        maxPriorityFeePerGas: "0x" + maxPriorityFeePerGas.toString(16),
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transaction build failed" });
  }
});

/* ===================== HEALTH ===================== */
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

/* ===================== START ===================== */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
