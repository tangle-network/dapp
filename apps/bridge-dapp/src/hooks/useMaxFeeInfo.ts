import { fetchFeeData, getPublicClient } from 'wagmi/actions';
import {
  ActiveWebbRelayer,
  RelayerFeeInfo,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import gasLimit from '@webb-tools/dapp-config/gasLimitConfig';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { PolkadotProvider } from '@webb-tools/polkadot-api-provider';
import {
  calculateTypedChainId,
  parseTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { WebbWeb3Provider } from '@webb-tools/web3-api-provider';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../utils';

/**
 * Get the max fee info for the current active chain
 * @returns an object with the following properties:
 * - feeInfo: RelayerFeeInfo | null
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
  feeInfo: RelayerFeeInfo | bigint | null;

  /**
   * Fetch the max fee info from the relayer if the active relayer is provided
   * Otherwise, calculate the max fee info from the gas price * hard-coded gas limit
   * @param activeRelayer The optional relayer to fetch the fee info from
   * @returns void
   */
  fetchFeeInfo: (activeRelayer?: ActiveWebbRelayer | null) => Promise<void>;

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
 * The option to customize the hook
 * @property {boolean} isHiddenNotiError Whether to hide the error notification
 */
export type MaxFeeInfoOption = {
  /**
   * Whether to hide the error notification
   */
  isHiddenNotiError?: boolean;

  /**
   * Fungible currency id
   */
  fungibleCurrencyId?: number;

  /**
   * The typed chain id if not provided, the hook will calculate the typed chain id from the active chain
   */
  typedChainId?: number;
};

/**
 * Get the max fee info for the current active chain
 * @param {MaxFeeInfoOption} opt The option to customize the hook
 * @returns an object with the following properties:
 * - feeInfo: RelayerFeeInfo | bigint | null
 * - fetchMaxFeeInfo: () => Promise<void> | never
 * - fetchMaxFeeInfoFromRelayer: (relayer: ActiveWebbRelayer) => Promise<void> | never
 * - resetMaxFeeInfo: () => void
 */
export const useMaxFeeInfo = (
  opt?: MaxFeeInfoOption
): UseMaxFeeInfoReturnType => {
  const { notificationApi } = useWebbUI();
  const { activeApi, activeChain, apiConfig } = useWebContext();

  // State to store the max fee info
  const [feeInfo, setFeeInfo] = useState<RelayerFeeInfo | bigint | null>(null);

  // State to store the loading state
  const [isLoading, setIsLoading] = useState(false);

  // State to store the error
  const [error, setError] = useState<unknown | null>(null);

  const typedChainId = useMemo(() => {
    if (typeof opt?.typedChainId === 'number') {
      return opt.typedChainId;
    }

    if (!activeChain) {
      return undefined;
    }

    return calculateTypedChainId(activeChain.chainType, activeChain.id);
  }, [activeChain, opt?.typedChainId]);

  const fetchMaxFeeInfoFromRelayer = useCallback(
    async (relayer: ActiveWebbRelayer): Promise<void> => {
      try {
        if (typeof typedChainId !== 'number') {
          throw new Error('No typed chain id selected');
        }

        if (!relayer) {
          throw new Error('No relayer selected');
        }

        if (!opt?.fungibleCurrencyId) {
          throw new Error('No fungible currency id selected');
        }

        setError(null);
        setIsLoading(true);

        const vanchorId = apiConfig.getAnchorIdentifier(
          opt.fungibleCurrencyId,
          typedChainId
        );
        if (!vanchorId) {
          console.error('No anchor address in current active chain');
          return;
        }

        const gasAmount = gasLimit[typedChainId] ?? gasLimit.default;
        const feeInfo = await relayer.getFeeInfo(
          typedChainId,
          vanchorId,
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
    [apiConfig, opt?.fungibleCurrencyId, typedChainId]
  );

  const calculateFeeInfo = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!activeApi || typeof typedChainId !== 'number') {
        return;
      }

      const gasAmount = gasLimit[typedChainId] ?? gasLimit.default;
      const provider = activeApi.getProvider();
      if (provider instanceof PolkadotProvider) {
        // On Substrate, we use partial fee dirrectly
        setFeeInfo(gasAmount);
        setIsLoading(false);
      } else if (activeApi instanceof WebbWeb3Provider) {
        const chainId = parseTypedChainId(typedChainId).chainId;
        const publicClient = getPublicClient({ chainId });

        const { maxFeePerGas, gasPrice, maxPriorityFeePerGas } =
          await fetchFeeData({ chainId });

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

        setFeeInfo(gasAmount * actualGasPrice);
      } else {
        throw WebbError.from(WebbErrorCodes.UnsupportedProvider);
      }
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [activeApi, typedChainId]);

  const fetchFeeInfo = useCallback(
    async (activeRelayer?: ActiveWebbRelayer | null) => {
      if (activeRelayer) {
        return fetchMaxFeeInfoFromRelayer(activeRelayer);
      } else {
        return calculateFeeInfo();
      }
    },
    [calculateFeeInfo, fetchMaxFeeInfoFromRelayer]
  );

  const resetMaxFeeInfo = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setFeeInfo(null);
  }, []);

  // Side effect to show notification when fetching fee info fails
  useEffect(() => {
    if (error && !opt?.isHiddenNotiError) {
      const message = getErrorMessage(error);
      notificationApi.addToQueue({
        variant: 'error',
        message: 'Failed to fetch max fee info',
        secondaryMessage: message,
      });
    }
  }, [error, notificationApi, opt?.isHiddenNotiError]);

  return {
    feeInfo,
    fetchFeeInfo,
    resetMaxFeeInfo,
    isLoading,
    error,
  };
};
