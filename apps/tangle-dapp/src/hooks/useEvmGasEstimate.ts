import { useCallback } from 'react';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { Hex } from 'viem';
import useAgnosticAccountInfo from '@webb-tools/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import useViemPublicClient from '@webb-tools/tangle-shared-ui/hooks/useViemPublicClient';

/**
 * Add a buffer to the gas estimate to ensure the
 * transaction is successful.
 */
const BUFFER = BigInt(15); // +50% (1.5)

const useEvmGasEstimate = () => {
  const { evmAddress } = useAgnosticAccountInfo();
  const viemPublicClient = useViemPublicClient();

  const estimateGas = useCallback(
    async (contractAddress: EvmAddress, callData: Hex) => {
      if (viemPublicClient === null || evmAddress === null) {
        return null;
      }

      const gasEstimate = await viemPublicClient.estimateContractGas({
        account: evmAddress,
        address: contractAddress,
        // TODO: Proper params.
        data: callData,
      });

      return (gasEstimate * BUFFER) / BigInt(10);
    },
    [evmAddress, viemPublicClient],
  );

  return estimateGas;
};

export default useEvmGasEstimate;
