import { ExternalLinkLine } from '@tangle-network/icons';
import { Button, Typography } from '@tangle-network/ui-components';
import capitalize from 'lodash/capitalize';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import { TxName } from '../constants';
import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';

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
  [TxName.PAYOUT_STAKERS_ALL]: 'Payout executed for all stakers',
  [TxName.SET_PAYEE]: 'Updated staking payout reward destination',
  [TxName.VEST]: 'Released vested tokens',
  [TxName.TRANSFER]: 'Transfer successful',
  [TxName.SETUP_NOMINATOR]: 'Nominator setup successful',
  [TxName.UPDATE_NOMINATOR]: 'Nominator updated',
  [TxName.WITHDRAW_EVM_BALANCE]: 'Withdrawal successful',
  [TxName.UPDATE_RESTAKE_PROFILE]: 'Restake profile updated',
  [TxName.LST_MINT]: 'Minted tokens',
  [TxName.LST_REDEEM]: 'Redeem request submitted',
  [TxName.LST_REBOND]: 'Unstake request cancelled',
  [TxName.LS_WITHDRAW_UNBONDED]: 'Unstake request executed',
  [TxName.LST_UPDATE_COMMISSION]: 'Updated commission rate',
  [TxName.LS_LIQUIFIER_DEPOSIT]: 'Liquifier deposit successful',
  [TxName.LS_LIQUIFIER_APPROVE]: 'Liquifier approval successful',
  [TxName.LS_LIQUIFIER_UNLOCK]: 'Liquifier unlock successful',
  [TxName.LS_LIQUIFIER_WITHDRAW]: 'Liquifier withdrawal successful',
  [TxName.LS_TANGLE_POOL_JOIN]: 'Joined liquid staking pool',
  [TxName.LS_TANGLE_POOL_UNBOND]: 'Unbonded from liquid staking pool',
  [TxName.LS_TANGLE_POOL_CREATE]: 'Created liquid staking pool',
  [TxName.LS_TANGLE_POOL_UPDATE_ROLES]: 'Updated pool roles',
  [TxName.RESTAKE_JOIN_OPERATORS]: 'Joined as an operator',
  [TxName.RESTAKE_DEPOSIT]: 'Deposited tokens',
  [TxName.RESTAKE_DELEGATE]: 'Delegated tokens',
  [TxName.RESTAKE_UNSTAKE]: 'Scheduled undelegate request',
  [TxName.RESTAKE_WITHDRAW]: 'Withdrawal scheduled',
  [TxName.RESTAKE_CANCEL_UNSTAKE]: 'Undelegate request(s) cancelled',
  [TxName.RESTAKE_EXECUTE_UNSTAKE]: 'Undelegate request executed',
  [TxName.RESTAKE_EXECUTE_WITHDRAW]: 'Withdraw request executed',
  [TxName.RESTAKE_CANCEL_WITHDRAW]: 'Withdraw request(s) cancelled',
  [TxName.CLAIM_REWARDS]: 'Claimed rewards',
  [TxName.DEMOCRACY_UNLOCK]: 'Democracy tokens unlocked',
  [TxName.RESTAKE_NATIVE_DELEGATE]: 'Restaked native tokens',
  [TxName.RESTAKE_NATIVE_UNSTAKE]: 'Scheduled undelegate request',
  [TxName.RESTAKE_NATIVE_UNSTAKE_EXECUTE]: 'Undelegate request(s) executed',
  [TxName.RESTAKE_NATIVE_UNSTAKE_CANCEL]: 'Undelegate request(s) cancelled',
};

const makeKey = (txName: TxName): `${TxName}-tx-notification` =>
  `${txName}-tx-notification`;

export type NotificationSteps = {
  current: number;
  total: number;
};

const useTxNotification = () => {
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
          <Typography variant="h5">{SUCCESS_MESSAGES[txName]}</Typography>

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
    [closeSnackbar, enqueueSnackbar, isEvmActiveAccount],
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
