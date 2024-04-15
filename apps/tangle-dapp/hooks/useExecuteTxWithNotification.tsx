import type { HexString } from '@polkadot/util/types';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import { ExplorerType } from '../types';
import ensureError from '../utils/ensureError';
import { evmPublicClient } from '../utils/evm';
import useExplorerUrl from './useExplorerUrl';

const useExecuteTxWithNotification = () => {
  const { activeWallet } = useWebContext();
  const getExplorerUrl = useExplorerUrl();
  const { enqueueSnackbar: enqueueNotifications } = useSnackbar();

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

        // TODO: tx explorer url is incorrect
        const txExplorerUrl = getExplorerUrl(
          txHash,
          activeWallet?.platform === 'EVM'
            ? ExplorerType.EVM
            : ExplorerType.Substrate
        );

        // Currently using SnackbarProvider for managing NotificationStacked
        // For one-off configurations, must use enqueueSnackbar
        enqueueNotifications(
          <div className="space-y-2">
            <Typography variant="h5" fw="bold">
              {successMessage}
            </Typography>
            {txExplorerUrl !== null && (
              <Button
                variant="link"
                size="sm"
                href={txExplorerUrl.toString()}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction
              </Button>
            )}
          </div>,
          {
            variant: 'success',
            autoHideDuration: null,
          }
        );

        return txHash;
      } catch (error) {
        enqueueNotifications(
          <div className="space-y-2">
            <Typography variant="h5" fw="bold">
              {errorMessage}
            </Typography>
            <Typography variant="body1">
              {ensureError(error).message}
            </Typography>
          </div>,
          {
            variant: 'error',
            autoHideDuration: 5000,
          }
        );

        throw error;
      }
    },
    [activeWallet?.platform, getExplorerUrl, enqueueNotifications]
  );

  return executeTx;
};

export default useExecuteTxWithNotification;
