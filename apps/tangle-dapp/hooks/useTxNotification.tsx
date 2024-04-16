import { HexString } from '@polkadot/util/types';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import { TxName } from '../constants';
import { ExplorerType } from '../types';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import useTxExplorerUrl from './useTxExplorerUrl';

const SUCCESS_TIMEOUT = 10_000;

const SUCCESS_MESSAGES: Record<TxName, string> = {
  [TxName.BOND]: 'Bonded tokens into staking',
  [TxName.BOND_EXTRA]: 'Added more tokens to existing stake',
  [TxName.UNBOND]: 'Unbonded tokens from staking',
  [TxName.REBOND]: 'Rebonded tokens into staking',
  [TxName.WITHDRAW_UNBONDED]: 'Withdrew all unbonded tokens',
  [TxName.CHILL]: 'Stopped nominating',
  [TxName.NOMINATE]: 'Nominated validators for staking',
  [TxName.PAYOUT_STAKERS]: 'Payout was successful',
  [TxName.SET_PAYEE]: 'Updated staking payout reward destination',
  [TxName.VEST]: 'Released vested tokens',
  [TxName.TRANSFER]: 'Transfer successful',
  [TxName.PAYOUT_ALL]: 'Payout executed for all stakers',
};

const useTxNotification = (txName: TxName) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const getTxExplorerUrl = useTxExplorerUrl();
  const { isEvm: isEvmActiveAccount } = useAgnosticAccountInfo();

  const processingKey = `${txName}-processing`;

  const notifySuccess = useCallback(
    (txHash: HexString) => {
      if (isEvmActiveAccount === null) {
        return;
      }

      closeSnackbar(processingKey);

      const txExplorerUrl = getTxExplorerUrl(
        txHash,
        isEvmActiveAccount ? ExplorerType.EVM : ExplorerType.Substrate
      );

      // Currently using SnackbarProvider for managing NotificationStacked
      // For one-off configurations, must use enqueueSnackbar.
      enqueueSnackbar(
        <div className="space-y-2">
          <Typography variant="h5">{SUCCESS_MESSAGES[txName]}</Typography>

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
      getTxExplorerUrl,
      isEvmActiveAccount,
      processingKey,
      txName,
    ]
  );

  const notifyError = useCallback(
    (error: Error) => {
      closeSnackbar(processingKey);

      enqueueSnackbar(
        <div>
          <Typography variant="h5">{txName}</Typography>

          <Typography variant="body1">{error.message}</Typography>
        </div>,
        {
          variant: 'error',
          // Leave the error message open until the user closes it,
          // that way they can copy the error message if needed, and
          // in case that they leave the page or not pay attention to
          // the error message, they can still see it when they return.
          autoHideDuration: null,
        }
      );
    },
    [closeSnackbar, enqueueSnackbar, processingKey, txName]
  );

  const notifyProcessing = useCallback(() => {
    closeSnackbar(processingKey);

    enqueueSnackbar(<Typography variant="h5">Processing {txName}</Typography>, {
      key: processingKey,
      variant: 'info',
      persist: true,
    });
  }, [closeSnackbar, enqueueSnackbar, processingKey, txName]);

  return { notifyProcessing, notifySuccess, notifyError };
};

export default useTxNotification;
