import {
  CoinsLineIcon,
  LockUnlockLineIcon,
  SendPlanLineIcon,
} from '@webb-tools/icons';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { FC, useState } from 'react';

import TransferTxModal from '../../containers/TransferTxModal';
import useBalances from '../../data/balances/useBalances';
import usePayoutsAvailability from '../../data/payouts/usePayoutsAvailability';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useVestTx from '../../data/vesting/useVestTx';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { StaticSearchQueryPath } from '../../types';
import formatTangleBalance from '../../utils/formatTangleBalance';
import ActionItem from './ActionItem';
import WithdrawEvmBalanceAction from './WithdrawEvmBalanceAction';

const Actions: FC = () => {
  const { nativeTokenSymbol } = useNetworkStore();

  const { execute: executeVestTx, status: vestTxStatus } = useVestTx();

  const isPayoutsAvailable = usePayoutsAvailability();
  const activeAccountAddress = useActiveAccountAddress();

  const { transferable: transferableBalance } = useBalances();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const {
    isVesting,
    hasClaimableTokens: hasClaimableVestingTokens,
    claimableAmount: claimableTokenAmount,
  } = useVestingInfo();

  const formattedClaimableTokenAmount =
    claimableTokenAmount !== null
      ? formatTangleBalance(claimableTokenAmount, nativeTokenSymbol)
      : null;

  return (
    <div className="flex items-center justify-start gap-6 overflow-x-auto">
      <ActionItem
        label="Send"
        Icon={SendPlanLineIcon}
        onClick={() => setIsTransferModalOpen(true)}
        // Disable while no account is connected, or when the active
        // account has no funds.
        isDisabled={
          activeAccountAddress === null ||
          transferableBalance === null ||
          transferableBalance.isZero()
        }
      />

      {isPayoutsAvailable && (
        <ActionItem
          hasNotificationDot
          label="Payouts"
          Icon={CoinsLineIcon}
          internalHref={StaticSearchQueryPath.PayoutsTable}
          tooltip="There are nomination payouts available to claim. Click here to visit the Nomination page."
        />
      )}

      {/* This is a special case, so hide it for most users if they're not vesting */}
      {isVesting && (
        <ActionItem
          Icon={LockUnlockLineIcon}
          label="Vest"
          onClick={executeVestTx !== null ? executeVestTx : undefined}
          hasNotificationDot={hasClaimableVestingTokens}
          isDisabled={
            vestTxStatus === TxStatus.PROCESSING ||
            !hasClaimableVestingTokens ||
            executeVestTx === null
          }
          tooltip={
            hasClaimableVestingTokens ? (
              <>
                There are <strong>{formattedClaimableTokenAmount}</strong>{' '}
                vested tokens that are ready to be claimed. Use this action to
                release them.
              </>
            ) : (
              <>
                There are vesting schedules in this account, but no tokens have
                vested yet.
              </>
            )
          }
        />
      )}

      <WithdrawEvmBalanceAction />

      <TransferTxModal
        isModalOpen={isTransferModalOpen}
        setIsModalOpen={setIsTransferModalOpen}
      />
    </div>
  );
};

export default Actions;
