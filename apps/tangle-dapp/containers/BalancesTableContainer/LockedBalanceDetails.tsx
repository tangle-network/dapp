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
import { FC, ReactNode, useCallback, useMemo } from 'react';

import { SubstrateLockId } from '../../constants';
import useBalancesLock from '../../data/balances/useBalancesLock';
import useDemocracy from '../../data/democracy/useDemocracy';
import useDemocracyUnlockTx from '../../data/democracy/useDemocracyUnlockTx';
import useCurrentEra from '../../data/staking/useCurrentEra';
import useUnbonding from '../../data/staking/useUnbonding';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useVestTx from '../../data/vesting/useVestTx';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import { PagePath } from '../../types';
import calculateTimeRemaining from '../../utils/calculateTimeRemaining';
import BalanceAction from './BalanceAction';
import BalanceCell from './BalanceCell';
import HeaderCell from './HeaderCell';

// TODO: Break this component into smaller components, as it is too big and complex (in terms of readability).
/** @internal */
const LockedBalanceDetails: FC = () => {
  const {
    schedulesOpt: vestingSchedulesOpt,
    currentBlockNumber,
    vestingLockAmount,
    isVesting,
  } = useVestingInfo();

  const { execute: executeVestTx } = useVestTx();

  const {
    lockedBalance: lockedDemocracyBalance,
    latestReferendum: latestDemocracyReferendum,
  } = useDemocracy();

  // TODO: Need to remove all expired democracy votes, and THEN perform the unlock transaction.
  const { execute: executeDemocracyUnlockTx } = useDemocracyUnlockTx();

  const isInDemocracy =
    lockedDemocracyBalance !== null && lockedDemocracyBalance.gtn(0);

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

  const democracyBalance = lockedDemocracyBalance !== null && isInDemocracy && (
    <div className="flex flex-row justify-between items-center">
      <BalanceCell amount={lockedDemocracyBalance} />

      <BalanceAction
        Icon={LockUnlockLineIcon}
        tooltip="Clear expired democracy locks."
        isDisabled={executeDemocracyUnlockTx === null}
        onClick={
          executeDemocracyUnlockTx !== null
            ? executeDemocracyUnlockTx
            : undefined
        }
      />
    </div>
  );

  const vestingSchedulesLabels =
    vestingSchedulesOpt !== null &&
    !vestingSchedulesOpt.isNone &&
    vestingSchedulesOpt
      .unwrap()
      .map((_schedule, index) => (
        <SmallPurpleChip key={index} title="Vesting" />
      ));

  const vestingSchedulesBalances = isVesting && vestingLockAmount !== null && (
    <div className="flex flex-row justify-between items-center">
      <BalanceCell amount={vestingLockAmount} />

      <BalanceAction
        Icon={LockUnlockLineIcon}
        onClick={executeVestTx !== null ? executeVestTx : undefined}
        isDisabled={executeVestTx === null}
        tooltip={
          <>
            Unlock this balance by performing a <strong>vest</strong>{' '}
            transaction.
          </>
        }
      />
    </div>
  );

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

      const timeRemaining = calculateTimeRemaining(
        babeExpectedBlockTime,
        currentBlockNumber,
        endingBlockNumber
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

  const democracyUnlockingAt =
    isInDemocracy &&
    (() => {
      const timeRemaining = calculateTimeRemaining(
        babeExpectedBlockTime,
        currentBlockNumber,
        democracyLockEndBlock
      );

      return (
        <TextCell
          status={
            timeRemaining !== null ? `${timeRemaining} remaining.` : undefined
          }
          text={
            democracyLockEndBlock === null
              ? 'Referendum ended'
              : `Referendum ongoing; ends at block #${democracyLockEndBlock}`
          }
        />
      );
    })();

  const stakingUnlockingAt = stakingLockedBalance !== null &&
    stakingLockedBalance.gtn(0) &&
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
        status={`${entry.remainingEras.toString()} era(s) remaining.`}
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

          {isInDemocracy && <SmallPurpleChip title="Democracy" />}

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

        {democracyBalance}

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
