import { HexString } from '@polkadot/util/types';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import useExplorerUrl, { ExplorerType } from './useExplorerUrl';

const useTxNotification = () => {
  const { enqueueSnackbar: enqueueNotifications } = useSnackbar();
  const getExplorerUrl = useExplorerUrl();
  const { isEvm: isEvmActiveAccount } = useAgnosticAccountInfo();

  const notifySuccess = useCallback(
    (txHash: HexString, message: string) => {
      if (isEvmActiveAccount === null) {
        return;
      }

      // TODO: tx explorer url is incorrect
      const txExplorerUrl = getExplorerUrl(
        txHash,
        isEvmActiveAccount ? ExplorerType.EVM : ExplorerType.Substrate
      );

      // Currently using SnackbarProvider for managing NotificationStacked
      // For one-off configurations, must use enqueueSnackbar
      enqueueNotifications(
        <div className="space-y-2">
          <Typography variant="h5" fw="bold">
            {message}
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
    },
    [enqueueNotifications, getExplorerUrl, isEvmActiveAccount]
  );

  const notifyError = useCallback(
    (message: string, error: Error) => {
      enqueueNotifications(
        <div className="space-y-2">
          <Typography variant="h5" fw="bold">
            {message}
          </Typography>

          <Typography variant="body1">{error.message}</Typography>
        </div>,
        {
          variant: 'error',
          autoHideDuration: 5000,
        }
      );
    },
    [enqueueNotifications]
  );

  return { notifySuccess, notifyError };
};

export default useTxNotification;
