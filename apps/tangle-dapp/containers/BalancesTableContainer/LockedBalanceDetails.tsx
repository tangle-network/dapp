// TODO: Consider moving this to a separate file since it's getting quite big.

import { CoinIcon, SendPlanLineIcon } from '@webb-tools/icons';
import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { HeaderCell } from '../../components/tableCells';
import { SubstrateLockId } from '../../constants';
import useBalancesLock from '../../hooks/useBalancesLock';
import useVesting from '../../hooks/useVesting';
import BalanceAction from './BalanceAction';
import BalanceCell from './BalanceCell';

/** @internal */
const LockedBalanceDetails: FC = () => {
  const { schedulesOpt: vestingSchedulesOpt } = useVesting();

  const { amount: democracyBalance } = useBalancesLock(
    SubstrateLockId.Democracy
  );

  const isInDemocracy = democracyBalance !== null && democracyBalance.gtn(0);

  const vestingSchedulesLabels =
    vestingSchedulesOpt !== null &&
    !vestingSchedulesOpt.isNone &&
    vestingSchedulesOpt
      .unwrap()
      .map((_schedule, index) => (
        <SmallPurpleChip key={index} title="Vesting" />
      ));

  const vestingSchedulesBalances =
    vestingSchedulesOpt !== null &&
    vestingSchedulesOpt.isSome &&
    vestingSchedulesOpt.unwrap().map((schedule, index) => (
      <div key={index} className="flex flex-row justify-between">
        <BalanceCell amount={schedule.locked} />

        <div className="flex flex-row gap-1">
          <BalanceAction
            Icon={SendPlanLineIcon}
            tooltip="Send"
            onClick={() => void 0}
          />

          <BalanceAction
            Icon={CoinIcon}
            tooltip="Nominate"
            onClick={() => void 0}
          />
        </div>
      </div>
    ));

  const vestingSchedulesUnlocking =
    vestingSchedulesOpt !== null &&
    !vestingSchedulesOpt.isNone &&
    vestingSchedulesOpt.unwrap().map((schedule, index) => {
      const endingBlockNumber = schedule.startingBlock.add(
        schedule.locked.div(schedule.perBlock)
      );

      return (
        <TextCell key={index} text={`Block #${endingBlockNumber} / Era #90`} />
      );
    });

  return (
    <div className="flex flex-row dark:bg-mono-180 px-3 py-2 rounded-lg">
      <div className="flex flex-row w-full">
        {/* Type */}
        <div className="flex flex-col gap-6 w-full items-start">
          <div className="self-stretch">
            <HeaderCell title="Type" />
          </div>

          {vestingSchedulesLabels}

          {isInDemocracy && <SmallPurpleChip title="Democracy" />}

          <SmallPurpleChip title="Nomination" />
        </div>

        {/* Unlocks at */}
        <div className="flex flex-col gap-6 w-full">
          <HeaderCell title="Unlocks At" />

          {vestingSchedulesUnlocking}

          {/* TODO: Calculate unlocking period. This may be a bit complex. */}
          {isInDemocracy && <TextCell text="Block #100 / Era #90" />}

          <TextCell text="Block #100 / Era #90" />
        </div>
      </div>

      {/* Balances */}
      <div className="flex flex-col gap-6 w-full">
        <HeaderCell title="Balance" />

        {vestingSchedulesBalances}

        {isInDemocracy && <BalanceCell amount={democracyBalance} />}

        <BalanceCell amount={null} />
      </div>
    </div>
  );
};

/** @internal */
const SmallPurpleChip: FC<{ title: string }> = ({ title }) => {
  return (
    <div className="p-3">
      <div className="dark:bg-purple-120 rounded-3xl px-4 py-1">
        <Typography
          variant="body2"
          fw="semibold"
          className="uppercase text-purple-50 dark:text-purple-50"
        >
          {title}
        </Typography>
      </div>
    </div>
  );
};

/** @internal */
const TextCell: FC<{
  text: string | null;
}> = ({ text }) => {
  return (
    <div className="flex flex-col justify-between p-3 gap-6">
      {text !== null ? (
        <Typography variant="body1" fw="semibold">
          {text}
        </Typography>
      ) : (
        <SkeletonLoader size="md" />
      )}
    </div>
  );
};

export default LockedBalanceDetails;
