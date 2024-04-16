import { HexString } from '@polkadot/util/types';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import { TxName } from '../constants';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import useExplorerUrl, { ExplorerType } from './useExplorerUrl';

const SUCCESS_TIMEOUT = 15_000;

const useTxNotification = (txName: TxName) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const getExplorerUrl = useExplorerUrl();
  const { isEvm: isEvmActiveAccount } = useAgnosticAccountInfo();

  const processingKey = `${txName}-processing`;

  const notifySuccess = useCallback(
    (txHash: HexString) => {
      if (isEvmActiveAccount === null) {
        return;
      }

      closeSnackbar(processingKey);

      // TODO: tx explorer url is incorrect
      const txExplorerUrl = getExplorerUrl(
        txHash,
        isEvmActiveAccount ? ExplorerType.EVM : ExplorerType.Substrate
      );

      // Currently using SnackbarProvider for managing NotificationStacked
      // For one-off configurations, must use enqueueSnackbar.
      enqueueSnackbar(
        <div className="space-y-2">
          <Typography variant="h5" fw="bold">
            {txName}
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
          key: txName,
          variant: 'success',
          autoHideDuration: SUCCESS_TIMEOUT,
        }
      );
    },
    [
      closeSnackbar,
      enqueueSnackbar,
      getExplorerUrl,
      isEvmActiveAccount,
      processingKey,
      txName,
    ]
  );

  const notifyError = useCallback(
    (error: Error) => {
      closeSnackbar(processingKey);

      enqueueSnackbar(
        <div className="space-y-2">
          <Typography variant="h5" fw="bold">
            {txName}
          </Typography>

          <Typography variant="body1">{error.message}</Typography>
        </div>,
        {
          variant: 'error',
          autoHideDuration: null,
        }
      );
    },
    [closeSnackbar, enqueueSnackbar, processingKey, txName]
  );

  const notifyProcessing = useCallback(() => {
    closeSnackbar(processingKey);

    enqueueSnackbar(
      <div className="space-y-2">
        <Typography variant="h5" fw="bold">
          Processing {txName}
        </Typography>
      </div>,
      {
        key: processingKey,
        variant: 'warning',
      }
    );
  }, [closeSnackbar, enqueueSnackbar, processingKey, txName]);

  return { notifyProcessing, notifySuccess, notifyError };
};

export default useTxNotification;
