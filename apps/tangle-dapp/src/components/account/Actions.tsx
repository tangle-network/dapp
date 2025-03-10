import { LockUnlockLineIcon, SendPlanLineIcon } from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { FC, useState } from 'react';

import TransferTxModal from '../../containers/TransferTxModal';
import useBalances from '../../data/balances/useBalances';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useVestTx from '../../data/vesting/useVestTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import formatTangleBalance from '../../utils/formatTangleBalance';
import ActionItem from './ActionItem';
import WithdrawEvmBalanceAction from './WithdrawEvmBalanceAction';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';

const Actions: FC = () => {
  const { nativeTokenSymbol } = useNetworkStore();
  const { execute: executeVestTx, status: vestTxStatus } = useVestTx();
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
    <div className="flex items-center justify-start gap-2 overflow-x-auto">
      <ActionItem
        Icon={SendPlanLineIcon}
        onClick={() => setIsTransferModalOpen(true)}
        // Disable while no account is connected, or when the active
        // account has no funds.
        isDisabled={
          activeAccountAddress === null ||
          transferableBalance === null ||
          transferableBalance.isZero()
        }
        tooltip={`Send ${nativeTokenSymbol}`}
      />

      {/* This is a special case, so hide it for most users if they're not vesting */}
      {isVesting && (
        <ActionItem
          Icon={LockUnlockLineIcon}
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
