import { BN_ZERO, formatDecimal } from '@polkadot/util';
import { ArrowRightUp } from '@webb-tools/icons';
import { Chip, Typography } from '@webb-tools/webb-ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { FC, useMemo } from 'react';

import { SubstrateLockId } from '../../../constants';
import useBalancesLock from '../../../data/balances/useBalancesLock';
import useDemocracy from '../../../data/democracy/useDemocracy';
import useCurrentEra from '../../../data/staking/useCurrentEra';
import useUnbonding from '../../../data/staking/useUnbonding';
import useVestingInfo from '../../../data/vesting/useVestingInfo';
import { PagePath } from '../../../types';
import BalanceAction from '../BalanceAction';
import BalanceCell from '../BalanceCell';
import HeaderCell from '../HeaderCell';
import DemocracyBalance from './DemocracyBalance';
import DemocracyUnlockAction from './DemocracyUnlockAction';
import DemocracyUnlockingAt from './DemocracyUnlockingAt';
import TextCell from './TextCell';
import VestingRemainingBalances from './VestingRemainingBalances';
import VestingScheduleBalances from './VestingScheduleBalances';
import VestingSchedulesUnlockingAt from './VestingSchedulesUnlockingAt';

const LockedBalanceDetails: FC = () => {
  const { schedulesOpt: vestingSchedulesOpt } = useVestingInfo();
  const { isInDemocracy } = useDemocracy();
  const { result: currentEra } = useCurrentEra();
  const { result: unbondingEntriesOpt } = useUnbonding();

  const { amount: stakingLockedBalance } = useBalancesLock(
    SubstrateLockId.STAKING,
  );

  const unbondingEntries = useMemo(() => {
    if (unbondingEntriesOpt === null || unbondingEntriesOpt.value === null) {
      return null;
    }

    return unbondingEntriesOpt.value;
  }, [unbondingEntriesOpt]);

  const showNomination =
    stakingLockedBalance !== null && stakingLockedBalance.gt(BN_ZERO);

  const visitNominationPageAction = (
    <BalanceAction
      Icon={ArrowRightUp}
      internalHref={PagePath.NOMINATION}
      tooltip={
        <>
          View more information on the <strong>Nomination</strong> page.
        </>
      }
    />
  );

  return (
    <div className="flex flex-row bg-glass dark:bg-none dark:bg-mono-180 px-3 py-2 pt-6 rounded-lg min-w-[630px]">
      <div className="flex flex-row w-full">
        {/* Type */}
        <div className="flex flex-col items-start w-full h-full">
          <div className="self-stretch">
            <HeaderCell title="Lock Type" />
          </div>

          {vestingSchedulesOpt !== null &&
            !vestingSchedulesOpt.isNone &&
            vestingSchedulesOpt
              .unwrap()
              .map((_schedule, index) => (
                <LabelChip key={index} title={`Vesting #${index + 1}`} />
              ))}

          {isInDemocracy && <LabelChip title="Democracy" />}

          {showNomination && <LabelChip title="Nomination" />}

          {unbondingEntries !== null &&
            unbondingEntries.length > 0 &&
            unbondingEntries.map((_unbondingInfo, index) => (
              <LabelChip key={index} title="Unbonding" />
            ))}
        </div>

        {/* Unlocks at */}
        <div className="flex flex-col w-full">
          <HeaderCell title="Unlocks At" />

          <VestingSchedulesUnlockingAt />

          <DemocracyUnlockingAt />

          {showNomination && <TextCell text={EMPTY_VALUE_PLACEHOLDER} />}

          {currentEra !== null &&
            unbondingEntries !== null &&
            unbondingEntries.length > 0 &&
            unbondingEntries.map((entry, index) => {
              const status = entry.remainingEras.isZero()
                ? undefined
                : `${formatDecimal(
                    entry.remainingEras.toString(),
                  )} era(s) remaining.`;

              const text = entry.remainingEras.isZero()
                ? 'Ready to withdraw'
                : `Era #${formatDecimal(entry.unlockEra.toString())}`;

              return <TextCell key={index} text={text} status={status} />;
            })}
        </div>
      </div>

      <div className="flex flex-row w-full">
        {/* Balances */}
        <div className="flex flex-col w-full">
          <HeaderCell title="Balance" />

          <VestingScheduleBalances />

          <DemocracyBalance />

          {showNomination && <BalanceCell amount={stakingLockedBalance} />}

          {unbondingEntries !== null &&
            unbondingEntries.length > 0 &&
            unbondingEntries.map((entry, index) => (
              <BalanceCell key={index} amount={entry.amount} />
            ))}
        </div>

        {/* Remaining */}
        <div className="flex flex-col w-full">
          <HeaderCell title="Remaining" />

          <VestingRemainingBalances />

          <div className="flex justify-end">
            <DemocracyUnlockAction />
          </div>

          {showNomination && (
            <div className="flex flex-row items-center justify-between">
              <TextCell text={EMPTY_VALUE_PLACEHOLDER} />

              {visitNominationPageAction}
            </div>
          )}

          {unbondingEntries !== null &&
            unbondingEntries.length > 0 &&
            unbondingEntries.map((_entry, index) => (
              <div
                key={index}
                className="flex flex-row items-center justify-between"
              >
                <TextCell text={EMPTY_VALUE_PLACEHOLDER} />

                {visitNominationPageAction}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

/** @internal */
const LabelChip: FC<{ title: string }> = ({ title }) => {
  return (
    <div className="py-2">
      <Chip color="purple">
        <Typography
          variant="body2"
          fw="semibold"
          className="uppercase text-purple-60 dark:text-purple-50"
        >
          {title}
        </Typography>
      </Chip>
    </div>
  );
};

export default LockedBalanceDetails;
