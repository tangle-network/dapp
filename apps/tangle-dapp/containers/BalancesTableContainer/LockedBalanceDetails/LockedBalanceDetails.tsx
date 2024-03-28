import { ArrowRightUp } from '@webb-tools/icons';
import { Chip, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { SubstrateLockId } from '../../../constants';
import useBalancesLock from '../../../data/balances/useBalancesLock';
import useDemocracy from '../../../data/democracy/useDemocracy';
import useCurrentEra from '../../../data/staking/useCurrentEra';
import useUnbonding from '../../../data/staking/useUnbonding';
import useVestingInfo from '../../../data/vesting/useVestingInfo';
import { PagePath } from '../../../types';
import { formatBnWithCommas } from '../../../utils';
import BalanceAction from '../BalanceAction';
import BalanceCell from '../BalanceCell';
import HeaderCell from '../HeaderCell';
import DemocracyBalance from './DemocracyBalance';
import DemocracyUnlockingAt from './DemocracyUnlockingAt';
import TextCell from './TextCell';
import VestingScheduleBalances from './VestingScheduleBalances';
import VestingSchedulesUnlockingAt from './VestingSchedulesUnlockingAt';

const LockedBalanceDetails: FC = () => {
  const { schedulesOpt: vestingSchedulesOpt } = useVestingInfo();
  const { isInDemocracy } = useDemocracy();
  const { data: currentEra } = useCurrentEra();
  const { data: unbondingEntries } = useUnbonding();

  const { amount: stakingLockedBalance } = useBalancesLock(
    SubstrateLockId.STAKING
  );

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
        <div className="flex flex-col w-full h-full items-start">
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

          {stakingLockedBalance !== null && <LabelChip title="Nomination" />}

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

          {stakingLockedBalance !== null && <TextCell text="—" />}

          {currentEra !== null &&
            unbondingEntries !== null &&
            unbondingEntries.length > 0 &&
            unbondingEntries.map((entry, index) => (
              <TextCell
                key={index}
                text={`Era #${formatBnWithCommas(entry.unlockEra)}`}
                status={`${formatBnWithCommas(
                  entry.remainingEras
                )} era(s) remaining.`}
              />
            ))}
        </div>
      </div>

      {/* Balances */}
      <div className="flex flex-col w-full">
        <HeaderCell title="Balance" />

        <VestingScheduleBalances />

        <DemocracyBalance />

        {stakingLockedBalance !== null && (
          <div className="flex flex-row justify-between items-center">
            <BalanceCell amount={stakingLockedBalance} />

            {visitNominationPageAction}
          </div>
        )}

        {unbondingEntries !== null &&
          unbondingEntries.length > 0 &&
          unbondingEntries.map((entry, index) => (
            <div
              key={index}
              className="flex flex-row justify-between items-center"
            >
              <BalanceCell key={index} amount={entry.amount} />

              {visitNominationPageAction}
            </div>
          ))}
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
