import {
  CoinsLineIcon,
  CoinsStackedLineIcon,
  FaucetIcon,
  GiftLineIcon,
  LockUnlockLineIcon,
  SendPlanLineIcon,
} from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { FC, useMemo, useState } from 'react';

import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useBalances from '@tangle-network/tangle-shared-ui/hooks/useBalances';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { TANGLE_FAUCET_URL } from '@tangle-network/ui-components';
import TransferTxModal from '../../containers/TransferTxModal';
import useAirdropEligibility from '../../data/claims/useAirdropEligibility';
import useTotalPayoutRewards from '../../data/nomination/useTotalPayoutRewards';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useVestTx from '../../data/vesting/useVestTx';
import { PagePath, StaticSearchQueryPath } from '../../types';
import formatTangleBalance from '../../utils/formatTangleBalance';
import ActionItem from './ActionItem';
import WithdrawEvmBalanceAction from './WithdrawEvmBalanceAction';

const Actions: FC = () => {
  const { nativeTokenSymbol } = useNetworkStore();
  const { execute: executeVestTx, status: vestTxStatus } = useVestTx();
  const activeAccountAddress = useActiveAccountAddress();
  const { transferable: transferableBalance } = useBalances();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const { isEligible: isAirdropEligible } = useAirdropEligibility();

  const { data } = useTotalPayoutRewards();

  const isPayoutsAvailable = useMemo(() => {
    return !data.isZero();
  }, [data]);

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
    <div className="flex items-center justify-start gap-4 overflow-x-auto">
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

      <ActionItem
        label="Nominate"
        internalHref={StaticSearchQueryPath.NominationsTable}
        Icon={CoinsStackedLineIcon}
      />

      <ActionItem
        label="Faucet"
        tooltip="Request testnet assets from the Tangle Network Faucet"
        Icon={FaucetIcon}
        externalHref={TANGLE_FAUCET_URL}
      />

      <ActionItem
        hasNotificationDot={isPayoutsAvailable}
        isDisabled={!isPayoutsAvailable || activeAccountAddress === null}
        label="Payouts"
        Icon={CoinsLineIcon}
        internalHref={StaticSearchQueryPath.PayoutsTable}
        tooltip={
          isPayoutsAvailable
            ? 'You have payouts available. Click here to visit the Payouts page.'
            : 'No payouts available.'
        }
      />

      {isAirdropEligible === null && isAirdropEligible && (
        <ActionItem
          label="Airdrop"
          hasNotificationDot={isAirdropEligible !== null && isAirdropEligible}
          isDisabled={!isAirdropEligible || activeAccountAddress === null}
          Icon={GiftLineIcon}
          internalHref={PagePath.CLAIM_AIRDROP}
          tooltip={
            <>
              Congratulations, you are eligible for the Tangle Network airdrop!
              Click here to visit the <strong>Claim Airdrop</strong> page.
            </>
          }
        />
      )}

      {/* This is a special case, so hide it for most users if they're not vesting */}
      {isVesting && (
        <ActionItem
          label="Unlock"
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
