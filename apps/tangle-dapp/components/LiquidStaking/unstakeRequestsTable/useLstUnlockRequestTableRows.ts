import assert from 'assert';
import { useMemo } from 'react';

import {
  LIQUID_STAKING_CHAINS,
  ParachainChainId,
  SimpleTimeUnitInstance,
} from '../../../constants/liquidStaking';
import useLstUnlockRequests from '../../../data/liquidStaking/useLstUnlockRequests';
import useOngoingTimeUnits, {
  OngoingTimeUnitEntry,
} from '../../../data/liquidStaking/useOngoingTimeUnits';
import { AnySubstrateAddress } from '../../../types/utils';
import timeUnitToMilliseconds from '../../../utils/liquidStaking/timeUnitToMilliseconds';
import { UnstakeRequestTableRow } from './UnstakeRequestsTable';

const estimateUnlockTimestamp = (
  chainId: ParachainChainId,
  unlockTimeUnit: SimpleTimeUnitInstance,
  ongoingTimeUnitEntry: OngoingTimeUnitEntry,
): number | undefined => {
  assert(
    ongoingTimeUnitEntry.timeUnit.unit === unlockTimeUnit.unit,
    'The time unit of the ongoing time unit should match the time unit of the unlock request',
  );

  const remainingTimeUnit: SimpleTimeUnitInstance = {
    unit: unlockTimeUnit.unit,
    value: unlockTimeUnit.value - ongoingTimeUnitEntry.timeUnit.value,
  };

  const remainingTimeInMilliseconds = timeUnitToMilliseconds(
    chainId,
    remainingTimeUnit,
  );

  const estimatedUnlockTimestamp =
    remainingTimeInMilliseconds > 0
      ? Date.now() + remainingTimeInMilliseconds
      : undefined;

  console.debug(
    'unlock',
    unlockTimeUnit,
    estimatedUnlockTimestamp,
    remainingTimeInMilliseconds,
    remainingTimeUnit,
    ongoingTimeUnitEntry,
  );

  return estimatedUnlockTimestamp;
};

const useLstUnlockRequestTableRows = () => {
  const tokenUnlockLedger = useLstUnlockRequests();
  const ongoingTimeUnits = useOngoingTimeUnits();

  const rows = useMemo<UnstakeRequestTableRow[] | null>(() => {
    // Data not loaded yet.
    if (tokenUnlockLedger === null || ongoingTimeUnits === null) {
      return null;
    }

    return tokenUnlockLedger
      .filter((entry) => {
        // Filter entries to include only those that are redeeming
        // into the native currency.
        return entry.currencyType === 'Native';
      })
      .map((request) => {
        // Find the corresponding chain in order to get the decimals.
        const chain = LIQUID_STAKING_CHAINS.find(
          (chain) => chain.currency === request.currency,
        );

        assert(
          chain !== undefined,
          'All currencies should be linked to a defined chain',
        );

        const ongoingTimeUnitEntry = ongoingTimeUnits.find(
          (ongoingTimeUnit) =>
            // TODO: Verify whether it's Native or LST.
            ongoingTimeUnit.currencyType === 'Native' &&
            ongoingTimeUnit.currency === request.currency,
        );

        assert(
          ongoingTimeUnitEntry !== undefined,
          'Ongoing time unit should be set if user was able to mint and redeem LSTs',
        );

        const estimatedUnlockTime = estimateUnlockTimestamp(
          chain.id,
          request.unlockTimeUnit,
          ongoingTimeUnitEntry,
        );

        // TODO: Is it >= or >?
        const hasUnlocked =
          ongoingTimeUnitEntry === undefined
            ? false
            : ongoingTimeUnitEntry.timeUnit.value >=
              request.unlockTimeUnit.value;

        return {
          unlockId: request.unlockId,
          amount: request.amount,
          estimatedUnlockTimestamp: estimatedUnlockTime,
          // TODO: Using dummy address for now.
          address:
            '0x1234567890abcdef1234567890abcdef123456789' as AnySubstrateAddress,
          hasUnlocked,
          currency: request.currency,
          decimals: chain.decimals,
        } satisfies UnstakeRequestTableRow;
      });
  }, [ongoingTimeUnits, tokenUnlockLedger]);

  return rows;
};

export default useLstUnlockRequestTableRows;
