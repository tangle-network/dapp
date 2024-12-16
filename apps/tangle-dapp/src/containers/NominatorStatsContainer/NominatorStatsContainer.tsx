import { BN_ZERO } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import {
  Button,
  Card,
  CardVariant,
  Divider,
} from '@webb-tools/webb-ui-components';
import {
  EMPTY_VALUE_PLACEHOLDER,
  SOCIAL_URLS_RECORD,
  TANGLE_DOCS_STAKING_URL,
  WEBB_DISCORD_CHANNEL_URL,
} from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { NominatorStatsItem, UnbondingStatsItem } from '../../components';
import useBalances from '../../data/balances/useBalances';
import useTotalPayoutRewards from '../../data/NominatorStats/useTotalPayoutRewards';
import useIsBondedOrNominating from '../../data/staking/useIsBondedOrNominating';
import useStakingLedger from '../../data/staking/useStakingLedger';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature, PagePath } from '../../types';
import formatTangleBalance from '../../utils/formatTangleBalance';
import { BondMoreTxContainer } from '../BondMoreTxContainer';
import { DelegateTxContainer } from '../DelegateTxContainer';
import { RebondTxContainer } from '../RebondTxContainer';
import { UnbondTxContainer } from '../UnbondTxContainer';
import { WithdrawUnbondedTxContainer } from '../WithdrawUnbondedTxContainer';

const NominatorStatsContainer: FC = () => {
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isBondMoreModalOpen, setIsBondMoreModalOpen] = useState(false);
  const [isUnbondModalOpen, setIsUnbondModalOpen] = useState(false);
  const [isRebondModalOpen, setIsRebondModalOpen] = useState(false);

  const activeAccountAddress = useActiveAccountAddress();
  const { activeAccount, loading: isActiveAccountLoading } = useWebContext();
  const { nativeTokenSymbol } = useNetworkStore();
  const networkFeatures = useNetworkFeatures();
  const { free: freeBalance, error: balancesError } = useBalances();
  const isBondedOrNominating = useIsBondedOrNominating();

  const { error: totalPayoutRewardsError, data: totalPayoutRewards } =
    useTotalPayoutRewards();

  const [isWithdrawUnbondedModalOpen, setIsWithdrawUnbondedModalOpen] =
    useState(false);

  const { result: bondedAmountOpt } = useStakingLedger(
    useCallback((ledger) => ledger.active.toBn(), []),
  );

  const bondedAmountBalance = useMemo(() => {
    if (bondedAmountOpt === null) {
      return null;
    }

    return formatTangleBalance(
      bondedAmountOpt.value ?? BN_ZERO,
      nativeTokenSymbol,
    );
  }, [bondedAmountOpt, nativeTokenSymbol]);

  const cardClass =
    'w-full space-y-4 rounded-2xl overflow-hidden h-min-[204px] p-4';

  return (
    <div>
      <div className="flex flex-col w-full gap-4 md:flex-row">
        <Card variant={CardVariant.GLASS} className={cardClass}>
          <div className="grid grid-cols-2 gap-2">
            <NominatorStatsItem
              title="Free Balance"
              isError={balancesError !== null}
            >
              {activeAccountAddress === null
                ? EMPTY_VALUE_PLACEHOLDER
                : freeBalance === null
                  ? null
                  : formatTangleBalance(freeBalance, nativeTokenSymbol)}
            </NominatorStatsItem>

            <NominatorStatsItem
              title="Unclaimed Payouts"
              isError={totalPayoutRewardsError !== null}
            >
              {totalPayoutRewards === null
                ? EMPTY_VALUE_PLACEHOLDER
                : formatTangleBalance(totalPayoutRewards) +
                  ` ${nativeTokenSymbol}`}
            </NominatorStatsItem>
          </div>

          <Divider className="my-6 bg-mono-0 dark:bg-mono-160" />

          <div className="flex flex-wrap items-center gap-2">
            {networkFeatures.includes(NetworkFeature.Faucet) &&
              !isActiveAccountLoading && (
                <Button
                  variant="utility"
                  className="!min-w-[100px]"
                  href={WEBB_DISCORD_CHANNEL_URL}
                  target="_blank"
                >
                  {`Get ${nativeTokenSymbol}`}
                </Button>
              )}

            <Link to={PagePath.ACCOUNT}>
              <Button
                variant="utility"
                className="!min-w-[100px]"
                isDisabled={isActiveAccountLoading}
              >
                View Account
              </Button>
            </Link>

            {/* Only allow nominator setup if not already nominating or bonded */}
            {isBondedOrNominating === false && (
              <Button
                variant="utility"
                className="!min-w-[100px]"
                isDisabled={!activeAccount}
                onClick={() => setIsDelegateModalOpen(true)}
              >
                Nominate
              </Button>
            )}
          </div>
        </Card>

        <Card variant={CardVariant.GLASS} className={cardClass}>
          <div className="grid grid-cols-2 gap-2">
            <NominatorStatsItem
              title={`Total Staked ${nativeTokenSymbol}`}
              tooltip="The total amount of tokens you have bonded for nominating."
              isError={false}
            >
              {activeAccountAddress === null
                ? EMPTY_VALUE_PLACEHOLDER
                : bondedAmountBalance === null
                  ? null
                  : bondedAmountBalance}
            </NominatorStatsItem>

            <UnbondingStatsItem />
          </div>

          <Divider className="my-6 bg-mono-0 dark:bg-mono-160" />

          <div className="grid grid-cols-2 gap-2">
            {isBondedOrNominating === true ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="utility"
                    className="!min-w-[100px]"
                    isDisabled={!activeAccount}
                    onClick={() => setIsBondMoreModalOpen(true)}
                  >
                    Add Stake
                  </Button>

                  <Button
                    variant="utility"
                    className="!min-w-[100px]"
                    isDisabled={!activeAccount}
                    onClick={() => setIsUnbondModalOpen(true)}
                  >
                    Unbond
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="utility"
                    className="!min-w-[100px]"
                    isDisabled={!activeAccount || isBondedOrNominating === null}
                    onClick={() => setIsRebondModalOpen(true)}
                  >
                    Rebond
                  </Button>

                  <Button
                    variant="utility"
                    className="!min-w-[100px]"
                    isDisabled={!activeAccount || isBondedOrNominating === null}
                    onClick={() => setIsWithdrawUnbondedModalOpen(true)}
                  >
                    Withdraw
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="utility"
                  href={TANGLE_DOCS_STAKING_URL}
                  target="_blank"
                >
                  Learn More
                </Button>

                <Button
                  variant="utility"
                  href={SOCIAL_URLS_RECORD.discord}
                  target="_blank"
                >
                  Join Community
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <DelegateTxContainer
        isModalOpen={isDelegateModalOpen}
        setIsModalOpen={setIsDelegateModalOpen}
      />

      <BondMoreTxContainer
        isModalOpen={isBondMoreModalOpen}
        setIsModalOpen={setIsBondMoreModalOpen}
      />

      <UnbondTxContainer
        isModalOpen={isUnbondModalOpen}
        setIsModalOpen={setIsUnbondModalOpen}
      />

      <RebondTxContainer
        isModalOpen={isRebondModalOpen}
        setIsModalOpen={setIsRebondModalOpen}
      />

      <WithdrawUnbondedTxContainer
        isModalOpen={isWithdrawUnbondedModalOpen}
        setIsModalOpen={setIsWithdrawUnbondedModalOpen}
      />
    </div>
  );
};

export default NominatorStatsContainer;
