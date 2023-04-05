import {
  ActiveWebbRelayer,
  RelayerFeeInfo,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { getLatestAnchorAddress } from '@webb-tools/dapp-config';
import { zeroAddress } from '@webb-tools/dapp-types';
import { NoteManager } from '@webb-tools/note-manager';
import { useCurrencies, useVAnchor } from '@webb-tools/react-hooks';
import { calculateTypedChainId, CircomUtxo, Note } from '@webb-tools/sdk-core';
import {
  Web3Provider,
  Web3VAnchorActions,
} from '@webb-tools/web3-api-provider';
import { BigNumber, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import gasLimit from '@webb-tools/dapp-config/gasLimit-config';

/**
 * Get the max fee info for the current active chain
 * @returns an object with the following properties:
 * - feeInfo: RelayerFeeInfo | BigNumber | null
 * - fetchMaxFeeInfo: () => Promise<void> | never
 * - fetchMaxFeeInfoFromRelayer: (relayer: ActiveWebbRelayer) => Promise<void> | never
 * - resetMaxFeeInfo: () => void
 * - isLoading: boolean
 * - error: unknown | null
 */
type UseMaxFeeInfoReturnType = {
  /**
   * The max fee info for the current active chain
   */
  feeInfo: RelayerFeeInfo | BigNumber | null;

  /**
   * Fetch the max fee info for the current active chain
   */
  fetchMaxFeeInfo: () => Promise<void>;

  /**
   * Fetch the max fee info for the current active chain from a specific relayer
   * @param relayer The relayer to fetch the max fee info from
   */
  fetchMaxFeeInfoFromRelayer: (relayer: ActiveWebbRelayer) => Promise<void>;

  /**
   * Reset the states inside the hook
   */
  resetMaxFeeInfo: () => void;

  /**
   * Whether the hook is fetching the max fee info
   */
  isLoading: boolean;

  /**
   * The error if any
   * @type {unknown | null}
   */
  error: unknown | null;
};

/**
 * Get the max fee info for the current active chain
 * @returns an object with the following properties:
 * - feeInfo: RelayerFeeInfo | BigNumber | null
 * - fetchMaxFeeInfo: () => Promise<void> | never
 * - fetchMaxFeeInfoFromRelayer: (relayer: ActiveWebbRelayer) => Promise<void> | never
 * - resetMaxFeeInfo: () => void
 */
export const useMaxFeeInfo = (): UseMaxFeeInfoReturnType => {
  const { activeApi, activeChain } = useWebContext();

  // State to store the max fee info
  const [feeInfo, setFeeInfo] = useState<RelayerFeeInfo | BigNumber | null>(
    null
  );

  // State to store the loading state
  const [isLoading, setIsLoading] = useState(false);

  // State to store the error
  const [error, setError] = useState<unknown | null>(null);

  const fetchMaxFeeInfoFromRelayer = useCallback(
    async (relayer: ActiveWebbRelayer): Promise<void> => {
      try {
        if (!activeChain) {
          throw new Error('No active chain');
        }

        if (!relayer) {
          throw new Error('No relayer selected');
        }

        setError(null);
        setIsLoading(true);

        const currentTypedChainId = calculateTypedChainId(
          activeChain.chainType,
          activeChain.chainId
        );

        const vanchorAddr = getLatestAnchorAddress(currentTypedChainId);
        if (!vanchorAddr) {
          console.error('No anchor address in current active chain');
          return;
        }

        const gasAmount = gasLimit[currentTypedChainId];
        if (!gasAmount) {
          throw new Error(
            `No gas amount config for current chain: ${currentTypedChainId}`
          );
        }

        const feeInfo = await relayer.getFeeInfo(
          currentTypedChainId,
          vanchorAddr,
          gasAmount
        );
        setFeeInfo(feeInfo);
      } catch (error) {
        setError(error);
        setFeeInfo(null);
      } finally {
        setIsLoading(false);
      }
    },
    [activeChain]
  );

  const fetchMaxFeeInfo = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!activeChain || !activeApi) {
        return;
      }

      const currentTypedChain = calculateTypedChainId(
        activeChain.chainType,
        activeChain.chainId
      );

      if (!gasLimit[currentTypedChain]) {
        throw new Error(
          `No gas amount config for current chain: ${currentTypedChain}`
        );
      }

      const provider = activeApi.getProvider();
      if (!(provider instanceof Web3Provider)) {
        throw new Error('Provider is not a Web3Provider');
      }

      const gasAmount = gasLimit[currentTypedChain];
      const etherProvider = provider.intoEthersProvider();

      // Get the greatest gas price
      let gasPrice = await etherProvider.getGasPrice();
      const feeData = await etherProvider.getFeeData();
      if (feeData.maxFeePerGas && feeData.maxFeePerGas.gt(gasPrice)) {
        gasPrice = feeData.maxFeePerGas;
      }

      if (
        feeData.maxPriorityFeePerGas &&
        feeData.maxPriorityFeePerGas.gt(gasPrice)
      ) {
        gasPrice = feeData.maxPriorityFeePerGas;
      }

      setFeeInfo(gasAmount.mul(gasPrice));
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [activeApi, activeChain]);

  const resetMaxFeeInfo = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setFeeInfo(null);
  }, []);

  return {
    feeInfo,
    fetchMaxFeeInfoFromRelayer,
    fetchMaxFeeInfo,
    resetMaxFeeInfo,
    isLoading,
    error,
  };
};
