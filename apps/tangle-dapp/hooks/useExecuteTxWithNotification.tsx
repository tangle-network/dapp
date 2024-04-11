import type { HexString } from '@polkadot/util/types';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { notificationApi } from '@webb-tools/webb-ui-components';
import { useCallback } from 'react';

import ensureError from '../utils/ensureError';
import { evmPublicClient } from '../utils/evm';
import useExplorerUrl, { ExplorerType } from './useExplorerUrl';

const useExecuteTxWithNotification = () => {
  const { activeWallet } = useWebContext();
  const getExplorerUrl = useExplorerUrl();

  /**
   * Executes a transaction based on the active wallet's platform.
   *
   * @param evmFnc - A function that returns a Promise resolving to a HexString. This function is used when the active wallet's platform is 'EVM'.
   * @param substrateFnc - A function that returns a Promise resolving to a HexString. This function is used when the active wallet's platform is 'Substrate'.
   * @param successMessage - The message to display when the transaction is successful.
   * @param errorMessage - The message to display when the transaction fails.
   *
   * @returns A Promise that resolves to a boolean. The Promise resolves to true if the transaction was successful, and false otherwise.
   */
  const executeTx = useCallback(
    async (
      evmFnc: () => Promise<HexString>,
      substrateFnc: () => Promise<HexString>,
      successMessage: string,
      errorMessage: string
    ): Promise<HexString> => {
      let txHash: HexString | null = null;
      try {
        if (activeWallet?.platform === 'EVM') {
          const evmTxHash = await evmFnc();

          const tx = await evmPublicClient.waitForTransactionReceipt({
            hash: evmTxHash,
          });

          if (tx.status === 'success') {
            txHash = evmTxHash;
          }
        } else if (activeWallet?.platform === 'Substrate') {
          const substrateTxHash = await substrateFnc();
          txHash = substrateTxHash;
        }

        if (!txHash) {
          throw new Error(errorMessage);
        }

        const txExplorerUrl = getExplorerUrl(
          txHash,
          activeWallet?.platform === 'EVM'
            ? ExplorerType.EVM
            : ExplorerType.Substrate
        );

        notificationApi({
          variant: 'success',
          message: successMessage,
          secondaryMessage: txExplorerUrl ? (
            <a
              href={txExplorerUrl.toString()}
              target="_blank"
              className="underline"
            >
              View Transaction
            </a>
          ) : undefined,
        });

        return txHash;
      } catch (error) {
        notificationApi({
          variant: 'error',
          message: ensureError(error).message,
        });

        throw error;
      }
    },
    [activeWallet?.platform, getExplorerUrl]
  );

  return executeTx;
};

export default useExecuteTxWithNotification;
