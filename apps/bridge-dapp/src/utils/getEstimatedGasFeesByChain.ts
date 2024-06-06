import getWagmiCfg from '@webb-tools/dapp-config/wagmi-config';
import { estimateFeesPerGas, getPublicClient } from 'wagmi/actions';
import { parseTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import gasLimit from '@webb-tools/dapp-config/gasLimitConfig';
import assert from 'assert';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';

export default async function getEstimatedGasFeesByChain(typedChainId: number) {
  const wagmiCfg = getWagmiCfg();

  const gasAmount = gasLimit[typedChainId] ?? gasLimit.default;

  const chainId = parseTypedChainId(typedChainId).chainId;
  const publicClient = getPublicClient(wagmiCfg, { chainId });

  assert(
    publicClient,
    WebbError.getErrorMessage(WebbErrorCodes.NoClientAvailable).message,
  );

  const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
    await estimateFeesPerGas(wagmiCfg, { chainId });

  let actualGasPrice = await publicClient.getGasPrice();
  if (gasPrice && gasPrice > actualGasPrice) {
    actualGasPrice = gasPrice;
  }

  if (maxFeePerGas && maxFeePerGas > actualGasPrice) {
    actualGasPrice = maxFeePerGas;
  }

  if (maxPriorityFeePerGas && maxPriorityFeePerGas > actualGasPrice) {
    actualGasPrice = maxPriorityFeePerGas;
  }

  return gasAmount * actualGasPrice;
}
