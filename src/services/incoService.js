import incoLite from "@inco/js/lite";
import incoJs from "@inco/js";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const { Lightning } = incoLite;
const { supportedChains } = incoJs;

function getIncoClient({ chainId, rpc, relayerPk }) {
  const account = privateKeyToAccount(`0x${relayerPk}`);

  const walletClient = createWalletClient({
    account,
    chain: supportedChains[chainId],
    transport: http(rpc),
  });

  const zap = Lightning.latest("testnet", chainId);

  return { zap, walletClient };
}

export async function encryptValue({
  value,
  accountAddress,
  dappAddress,
  chainId,
  rpc,
  relayerPk,
}) {
  const { zap, walletClient } = getIncoClient({
    chainId,
    rpc,
    relayerPk,
  });

  return zap.encrypt(value, {
    accountAddress,
    dappAddress,
    walletClient,
  });
}

export async function decryptValue({
  handle,
  chainId,
  rpc,
  relayerPk,
}) {
  const { zap, walletClient } = getIncoClient({
    chainId,
    rpc,
    relayerPk,
  });

  const reencryptor = await zap.getReencryptor(walletClient);
  const result = await reencryptor({ handle });

  return result.value;
}
