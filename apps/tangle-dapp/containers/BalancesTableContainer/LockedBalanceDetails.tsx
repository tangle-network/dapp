import {
  ArrowRightUp,
  LockUnlockLineIcon,
  StatusIndicator,
} from '@webb-tools/icons';
import {
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { formatDistance } from 'date-fns';
import { capitalize } from 'lodash';
import { FC, ReactNode, useCallback, useMemo } from 'react';

import { SubstrateLockId } from '../../constants';
import useBalancesLock from '../../data/balances/useBalancesLock';
import useDemocracy from '../../data/democracy/useDemocracy';
import useCurrentEra from '../../data/staking/useCurrentEra';
import useUnbonding from '../../data/staking/useUnbonding';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useVestTx from '../../data/vesting/useVestTx';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import { PagePath } from '../../types';
import BalanceAction from './BalanceAction';
import BalanceCell from './BalanceCell';
import HeaderCell from './HeaderCell';

// TODO: Break this component into smaller components, as it is too big and complex (in terms of readability).
/** @internal */
const LockedBalanceDetails: FC = () => {
  const { schedulesOpt: vestingSchedulesOpt, currentBlockNumber } =
    useVestingInfo();

  const { execute: executeVestTx } = useVestTx();

  const {
    lockedBalance: democracyBalance,
    latestReferendum: latestDemocracyReferendum,
  } = useDemocracy();

  const hasDemocracyLockedBalance =
    democracyBalance !== null && democracyBalance.gtn(0);

  const democracyLockEndBlock =
    latestDemocracyReferendum !== null && latestDemocracyReferendum.isOngoing
      ? latestDemocracyReferendum.asOngoing.end
      : null;

  const { data: currentEra } = useCurrentEra();

  const { amount: stakingLockedBalance } = useBalancesLock(
    SubstrateLockId.Staking
  );
  const { data: unbondingEntries } = useUnbonding();

  const stakingLongestUnbondingEra =
    unbondingEntries === null || unbondingEntries.length === 0
      ? null
      : unbondingEntries.reduce((longest, current) => {
          return current.unlockEra.gt(longest) ? current.unlockEra : longest;
        }, unbondingEntries[0].unlockEra);

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
      <div key={index} className="flex flex-row justify-between items-center">
        <BalanceCell amount={schedule.locked} />

        <BalanceAction
          Icon={LockUnlockLineIcon}
          onClick={executeVestTx}
          tooltip={
            <>
              Unlock this balance by performing a <strong>vest</strong>{' '}
              transaction.
            </>
          }
        />
      </div>
    ));

  const { value: babeExpectedBlockTime } = usePolkadotApi(
    useCallback((api) => Promise.resolve(api.consts.babe.expectedBlockTime), [])
  );

  const vestingSchedulesUnlockingAt = useMemo(() => {
    if (
      babeExpectedBlockTime === null ||
      currentBlockNumber === null ||
      vestingSchedulesOpt === null ||
      vestingSchedulesOpt.isNone
    ) {
      return null;
    }

    return vestingSchedulesOpt.unwrap().map((schedule, index) => {
      const endingBlockNumber = schedule.startingBlock.add(
        schedule.locked.div(schedule.perBlock)
      );

      const timeRemainingInMs = babeExpectedBlockTime
        .mul(endingBlockNumber.sub(currentBlockNumber).abs())
        .toNumber();

      const timeRemaining = capitalize(
        formatDistance(Date.now() + timeRemainingInMs, Date.now())
      );

      const isComplete = currentBlockNumber.gte(endingBlockNumber);

      const progressText = isComplete ? (
        <>All of your vested tokens are now available to claim. </>
      ) : (
        `${timeRemaining} remaining.`
      );

      return (
        <TextCell
          key={index}
          text={`Block #${endingBlockNumber}`}
          status={progressText}
        />
      );
    });
  }, [babeExpectedBlockTime, currentBlockNumber, vestingSchedulesOpt]);

  const democracyUnlockingAt = hasDemocracyLockedBalance && (
    <TextCell
      text={
        democracyLockEndBlock === null ? '—' : `Block #${democracyLockEndBlock}`
      }
    />
  );

  const stakingUnlockingAt = stakingLockedBalance !== null &&
    stakingLongestUnbondingEra !== null && <TextCell text="—" />;

  const unbondingLabels =
    unbondingEntries !== null &&
    unbondingEntries.length > 0 &&
    unbondingEntries.map((_unbondingInfo, index) => (
      <SmallPurpleChip key={index} title="Unbonding" />
    ));

  const unbondingUnlockingAt =
    currentEra !== null &&
    unbondingEntries !== null &&
    unbondingEntries.length > 0 &&
    unbondingEntries.map((entry, index) => (
      <TextCell
        key={index}
        text={`Era #${entry.unlockEra}`}
        status={`${entry.remainingEras.toString()} eras remaining.`}
      />
    ));

  const evmStakingAction = (
    <BalanceAction
      Icon={ArrowRightUp}
      internalHref={PagePath.EvmStaking}
      tooltip={
        <>
          View more information on the <strong>EVM Staking</strong> page.
        </>
      }
    />
  );

  const stakingBalance = stakingLockedBalance !== null && (
    <div className="flex flex-row justify-between items-center">
      <BalanceCell amount={stakingLockedBalance} />

      {evmStakingAction}
    </div>
  );

  const unbondingBalances =
    unbondingEntries !== null &&
    unbondingEntries.length > 0 &&
    unbondingEntries.map((entry, index) => (
      <div key={index} className="flex flex-row justify-between items-center">
        <BalanceCell key={index} amount={entry.amount} />

        {evmStakingAction}
      </div>
    ));

  return (
    <div className="flex flex-row bg-glass dark:bg-none dark:bg-mono-180 px-3 py-2 rounded-lg min-w-[630px]">
      <div className="flex flex-row w-full">
        {/* Type */}
        <div className="flex flex-col w-full h-full items-start">
          <div className="self-stretch">
            <HeaderCell title="Lock Type" />
          </div>

          {vestingSchedulesLabels}

          {hasDemocracyLockedBalance && <SmallPurpleChip title="Democracy" />}

          {stakingLockedBalance !== null && (
            <SmallPurpleChip title="Nomination" />
          )}

          {unbondingLabels}
        </div>

        {/* Unlocks at */}
        <div className="flex flex-col w-full">
          <HeaderCell title="Unlocks At" />

          {vestingSchedulesUnlockingAt}

          {democracyUnlockingAt}

          {stakingUnlockingAt}

          {unbondingUnlockingAt}
        </div>
      </div>

      {/* Balances */}
      <div className="flex flex-col w-full">
        <HeaderCell title="Balance" />

        {vestingSchedulesBalances}

        {hasDemocracyLockedBalance && <BalanceCell amount={democracyBalance} />}

        {stakingBalance}

        {unbondingBalances}
      </div>
    </div>
  );
};

/** @internal */
const SmallPurpleChip: FC<{ title: string }> = ({ title }) => {
  return (
    <div className="py-2">
      <div className="bg-purple-10 dark:bg-purple-120 rounded-3xl px-4 py-1">
        <Typography
          variant="body2"
          fw="semibold"
          className="uppercase text-purple-60 dark:text-purple-50"
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
  status?: ReactNode;
}> = ({ text, status }) => {
  return (
    <div className="flex flex-row p-3 gap-2">
      {text !== null ? (
        <Typography variant="body1" fw="semibold">
          {text}
        </Typography>
      ) : (
        <SkeletonLoader size="md" />
      )}

      {status !== undefined && (
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <StatusIndicator size={12} variant="info" />
          </TooltipTrigger>

          <TooltipBody className="break-normal max-w-[250px] text-center">
            {status}
          </TooltipBody>
        </Tooltip>
      )}
    </div>
  );
};

export default LockedBalanceDetails;
