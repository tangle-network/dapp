import { HexString } from '@polkadot/util/types';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import capitalize from 'lodash/capitalize';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import { TxName } from '../constants';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import useExplorerUrl from './useExplorerUrl';

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
  [TxName.SETUP_NOMINATOR]: 'Nominator setup successful',
  [TxName.UPDATE_NOMINATOR]: 'Nominator updated',
  [TxName.WITHDRAW_EVM_BALANCE]: 'Withdrawal successful',
  [TxName.UPDATE_RESTAKE_PROFILE]: 'Restake profile updated',
  [TxName.BRIDGE_TRANSFER]: 'Bridge transferred successful',
  [TxName.LST_MINT]: 'Minted tokens',
  [TxName.LST_REDEEM]: 'Redeem request submitted',
  [TxName.LST_REBOND]: 'Unstake request cancelled',
  [TxName.LST_WITHDRAW_REDEEM]: 'Unstake request executed',
  [TxName.LS_LIQUIFIER_DEPOSIT]: 'Liquifier deposit successful',
  [TxName.LS_LIQUIFIER_APPROVE]: 'Liquifier approval successful',
  [TxName.LS_LIQUIFIER_UNLOCK]: 'Liquifier unlock successful',
  [TxName.LS_LIQUIFIER_WITHDRAW]: 'Liquifier withdrawal successful',
  [TxName.LS_TANGLE_POOL_JOIN]: 'Joined liquid staking pool',
  [TxName.LS_TANGLE_POOL_UNBOND]: 'Unbonded from liquid staking pool',
  [TxName.LS_TANGLE_POOL_CREATE]: 'Created liquid staking pool',
};

const makeKey = (txName: TxName): `${TxName}-tx-notification` =>
  `${txName}-tx-notification`;

export type NotificationSteps = {
  current: number;
  total: number;
};

// TODO: Use a ref for the key to permit multiple rapid fire transactions from stacking under the same key. Otherwise, use a global state counter via Zustand.
const useTxNotification = (explorerUrl?: string) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const getTxExplorerUrl = useExplorerUrl();
  const { isEvm: isEvmActiveAccount } = useAgnosticAccountInfo();

  // TODO: Consider warning the user if they attempt to close the browser window. The transaction won't fail, but they won't be able to see the result. Might need a global store to track the event listener, to prevent multiple listeners from being added.

  const notifySuccess = useCallback(
    (txName: TxName, txHash: HexString, successMessage?: string | null) => {
      closeSnackbar(makeKey(txName));

      // In case that the EVM account status is unavailable,
      // default to not display the transaction explorer URL,
      // since it is not possible to determine anymore. However,
      // this allows the user to still see the success message if
      // for example, they disconnect their account while the
      // transaction is still processing.
      const txExplorerUrl =
        isEvmActiveAccount === null
          ? null
          : getTxExplorerUrl(txHash, 'tx', undefined, explorerUrl);

      // Currently using SnackbarProvider for managing NotificationStacked
      // For one-off configurations, must use enqueueSnackbar.
      enqueueSnackbar(
        <div className="space-y-2">
          <Typography variant="h5">{SUCCESS_MESSAGES[txName]}</Typography>

          {successMessage && (
            <Typography variant="body1">{successMessage}</Typography>
          )}

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
          autoHideDuration: SUCCESS_TIMEOUT,
        },
      );
    },
    [
      closeSnackbar,
      enqueueSnackbar,
      getTxExplorerUrl,
      isEvmActiveAccount,
      explorerUrl,
    ],
  );

  const notifyError = useCallback(
    (txName: TxName, error: Error | string) => {
      closeSnackbar(makeKey(txName));

      const errorMessage = typeof error === 'string' ? error : error.message;

      enqueueSnackbar(
        <div>
          <Typography variant="h5">{capitalize(txName)} failed</Typography>

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
