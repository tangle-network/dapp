import { fetchFeeData, getPublicClient } from 'wagmi/actions';
import { parseTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import gasLimit from '@webb-tools/dapp-config/gasLimitConfig';

export default async function getEstimatedGasFeesByChain(typedChainId: number) {
  const gasAmount = gasLimit[typedChainId] ?? gasLimit.default;

  const chainId = parseTypedChainId(typedChainId).chainId;
  const publicClient = getPublicClient({ chainId });

  const { maxFeePerGas, gasPrice, maxPriorityFeePerGas } = await fetchFeeData({
    chainId,
  });

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
