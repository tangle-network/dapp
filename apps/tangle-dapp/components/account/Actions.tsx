'use client';

import {
  ArrowLeftRightLineIcon,
  CoinsLineIcon,
  CoinsStackedLineIcon,
  GiftLineIcon,
  LockUnlockLineIcon,
} from '@webb-tools/icons';
import { FC, useState } from 'react';

import TransferTxContainer from '../../containers/TransferTxContainer/TransferTxContainer';
import useNetworkStore from '../../context/useNetworkStore';
import useBalances from '../../data/balances/useBalances';
import useAirdropEligibility from '../../data/claims/useAirdropEligibility';
import usePayoutsAvailability from '../../data/payouts/usePayoutsAvailability';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useVestTx from '../../data/vesting/useVestTx';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { PagePath, StaticSearchQueryPath } from '../../types';
import formatTangleAmount from '../../utils/formatTangleAmount';
import ActionItem from './ActionItem';
import WithdrawEvmBalanceAction from './WithdrawEvmBalanceAction';

const Actions: FC = () => {
  const { nativeTokenSymbol } = useNetworkStore();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const { execute: executeVestTx, status: vestTxStatus } = useVestTx();
  const { isEligible: isAirdropEligible } = useAirdropEligibility();

  const isPayoutsAvailable = usePayoutsAvailability();
  const activeAccountAddress = useActiveAccountAddress();

  const { transferable: transferableBalance } = useBalances();

  const {
    isVesting,
    hasClaimableTokens: hasClaimableVestingTokens,
    claimableAmount: claimableTokenAmount,
  } = useVestingInfo();

  const formattedClaimableTokenAmount =
    claimableTokenAmount !== null
      ? formatTangleAmount(claimableTokenAmount, nativeTokenSymbol)
      : null;

  return (
    <>
      <div className="flex items-center justify-start gap-6 overflow-x-auto">
        <ActionItem
          label="Transfer"
          Icon={ArrowLeftRightLineIcon}
          onClick={() => setIsTransferModalOpen(true)}
          // Disable while no account is connected, or when the active
          // account has no funds.
          isDisabled={
            activeAccountAddress === null ||
            transferableBalance === null ||
            transferableBalance.isZero()
          }
        />

        <ActionItem
          label="Nominate"
          internalHref={StaticSearchQueryPath.NominationsTable}
          Icon={CoinsStackedLineIcon}
        />

        {isPayoutsAvailable && (
          <ActionItem
            hasNotificationDot
            label="Payouts"
            Icon={CoinsLineIcon}
            internalHref={StaticSearchQueryPath.PayoutsTable}
            tooltip="You have payouts available. Click here to visit the Payouts page."
          />
        )}

        {isAirdropEligible && (
          <ActionItem
            label="Claim Airdrop"
            hasNotificationDot
            Icon={GiftLineIcon}
            internalHref={PagePath.CLAIM_AIRDROP}
            tooltip={
              <>
                Congratulations, you are eligible for the Tangle Network
                airdrop! Click here to visit the <strong>Claim Airdrop</strong>{' '}
                page.
              </>
            }
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
                  There are vesting schedules in this account, but no tokens
                  have vested yet.
                </>
              )
            }
          />
        )}

        <WithdrawEvmBalanceAction />
      </div>

      {/* TODO: Might be better to use a hook instead of doing it this way. */}
      <div className="!m-0">
        <TransferTxContainer
          isModalOpen={isTransferModalOpen}
          setIsModalOpen={setIsTransferModalOpen}
        />
      </div>
    </>
  );
};

export default Actions;
