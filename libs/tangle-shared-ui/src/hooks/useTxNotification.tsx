import { ExternalLinkLine } from '@tangle-network/icons';
import { Button, Typography } from '@tangle-network/ui-components';
import capitalize from 'lodash/capitalize';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import useAgnosticAccountInfo from './useAgnosticAccountInfo';

const SUCCESS_TIMEOUT = 10_000;

type BaseTxName = string | number;

const makeKey = <TxName extends BaseTxName>(txName: TxName): `${TxName}-tx-notification` =>
  `${txName}-tx-notification` as `${TxName}-tx-notification`;

export type NotificationSteps = {
  current: number;
  total: number;
};

const useTxNotification = <TxName extends BaseTxName>(
  successMessageByTxName: Record<TxName, string>,
) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { isEvm: isEvmActiveAccount } = useAgnosticAccountInfo();

  const notifySuccess = useCallback(
    (
      txName: TxName,
      explorerUrl?: string | null,
      successMessage?: string | null,
    ) => {
      closeSnackbar(makeKey(txName));

      // TODO: Finish handling EVM accounts case.

      // In case that the EVM account status is unavailable,
      // default to not display the transaction explorer URL,
      // since it is not possible to determine anymore. However,
      // this allows the user to still see the success message if
      // for example, they disconnect their account while the
      // transaction is still processing.
      const finalExplorerUrl =
        explorerUrl === undefined ||
        explorerUrl === null ||
        isEvmActiveAccount === null
          ? null
          : explorerUrl;

      // Currently using SnackbarProvider for managing NotificationStacked
      // For one-off configurations, must use enqueueSnackbar.
      enqueueSnackbar(
        <div className="space-y-2">
          <Typography variant="h5">{successMessageByTxName[txName]}</Typography>

          {successMessage && (
            <Typography variant="body1">{successMessage}</Typography>
          )}

          {finalExplorerUrl !== null && (
            <Button
              variant="link"
              size="sm"
              href={finalExplorerUrl.toString()}
              target="_blank"
              rel="noopener noreferrer"
              rightIcon={
                <ExternalLinkLine className="fill-current dark:fill-current" />
              }
            >
              View Explorer
            </Button>
          )}
        </div>,
        {
          variant: 'success',
          autoHideDuration: SUCCESS_TIMEOUT,
        },
      );
    },
    [closeSnackbar, enqueueSnackbar, isEvmActiveAccount, successMessageByTxName],
  );

  const notifyError = useCallback(
    (txName: TxName, error: Error | string) => {
      closeSnackbar(makeKey(txName));

      const errorMessage = typeof error === 'string' ? error : error.message;

      enqueueSnackbar(
        <div>
          <Typography variant="h5">{capitalize(txName.toString())} failed</Typography>

          <Typography variant="body1">{errorMessage}</Typography>
        </div>,
        {
          variant: 'error',
          // Leave the error message open until the user closes it,
          // that way they can copy the error message if needed, and
          // in case that they leave the page or not pay attention to
          // the error message, they can still see it when they return.
          autoHideDuration: null,
        },
      );
    },
    [closeSnackbar, enqueueSnackbar],
  );

  const notifyProcessing = useCallback(
    (txName: TxName, steps?: NotificationSteps) => {
      // Sanity check.
      if (steps !== undefined && steps.current > steps.total) {
        console.warn(
          'Current transaction notification steps exceed the maximum steps (check for off-by-one errors)',
        );
      }

      const key = makeKey(txName);

      closeSnackbar(makeKey(txName));

      enqueueSnackbar(
        <Typography variant="h5">
          {steps !== undefined && `(${steps.current}/${steps.total}) `}
          Processing {txName}
        </Typography>,
        {
          key,
          variant: 'info',
          persist: true,
        },
      );
    },
    [closeSnackbar, enqueueSnackbar],
  );

  return { notifyProcessing, notifySuccess, notifyError };
};

export default useTxNotification;
