import { useCallback } from 'react';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useApi from '../../hooks/useApi';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import getBlockDate from '../../utils/getBlockDate';
import calculateTimeRemaining from '../../utils/calculateTimeRemaining';
import { BalanceLockRow } from '.';
import { LockUnlocksAtKind, SubstrateLockId } from '../../constants';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import { sortVestingSchedulesAscending } from '../BalancesTableContainer/LockedBalanceDetails/utils';
import { BN, BN_ZERO } from '@polkadot/util';

const useVestingLockRows = (): BalanceLockRow[] | null => {
  const { schedulesOpt: vestingSchedulesOpt } = useVestingInfo();

  const { result: currentBlockNumber } = useApiRx(
    useCallback((api) => api.derive.chain.bestNumber(), []),
  );

  const { result: babeExpectedBlockTime } = useApi(
    useCallback((api) => api.consts.babe.expectedBlockTime, []),
  );

  if (
    babeExpectedBlockTime === null ||
    currentBlockNumber === null ||
    vestingSchedulesOpt === null ||
    vestingSchedulesOpt.isNone
  ) {
    return null;
  }

  return vestingSchedulesOpt
    .unwrap()
    .toSorted(sortVestingSchedulesAscending)
    .map((schedule, index) => {
      const endingBlockNumber = schedule.startingBlock.add(
        schedule.locked.div(schedule.perBlock),
      );

      const endingBlockDate = getBlockDate(
        babeExpectedBlockTime,
        currentBlockNumber,
        endingBlockNumber,
      );

      const timeRemaining = endingBlockDate
        ? calculateTimeRemaining(endingBlockDate)
        : null;

      const isComplete = currentBlockNumber.gte(endingBlockNumber);

      const tooltip = isComplete
        ? undefined
        : `${timeRemaining} remaining. Currently at block #${addCommasToNumber(
            currentBlockNumber.toString(),
          )}, with ${addCommasToNumber(
            endingBlockNumber.sub(currentBlockNumber).toString(),
          )} blocks left until all vested tokens are available to claim.`;

      // Do not exceed the total locked amount in case that
      // the ending block has already passed, and the difference
      // between the current block number and the starting block
      // number exceeds the total locked amount.
      const amountAlreadyVested = currentBlockNumber?.gt(schedule.startingBlock)
        ? BN.min(
            schedule.locked,
            currentBlockNumber
              .sub(schedule.startingBlock)
              .mul(schedule.perBlock),
          )
        : BN_ZERO;

      const remaining = schedule.locked.sub(amountAlreadyVested);

      return {
        index,
        type: SubstrateLockId.VESTING,
        remaining,
        totalLocked: schedule.locked,
        unlocksAt: endingBlockNumber,
        unlocksAtKind: LockUnlocksAtKind.BLOCK,
        unlocksAtTooltip: tooltip,
        isUnlocked: isComplete,
      } satisfies BalanceLockRow;
    });
};

export default useVestingLockRows;
