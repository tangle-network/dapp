import assert from 'assert';
import { useMemo } from 'react';

import { LIQUID_STAKING_CHAINS } from '../../../constants/liquidStaking';
import useLstUnlockRequests from '../../../data/liquidStaking/useLstUnlockRequests';
import useOngoingTimeUnits from '../../../data/liquidStaking/useOngoingTimeUnits';
import { AnySubstrateAddress } from '../../../types/utils';
import timeUnitToMilliseconds from '../../../utils/liquidStaking/timeUnitToMilliseconds';
import { UnstakeRequestTableRow } from './UnstakeRequestsTable';

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

        // TODO: Don't rely on this assumption, as it might be the case that newly introduced currencies don't yet have an ongoing time unit registered onchain, and this may lead to a crash.
        assert(
          ongoingTimeUnitEntry !== undefined,
          'All currencies should have an ongoing time unit entry onchain',
        );

        assert(
          ongoingTimeUnitEntry.timeUnit.unit === request.unlockTimeUnit.unit,
          'The time unit of the ongoing time unit should match the time unit of the unlock request',
        );

        // TODO: Is it >= or >?
        const hasUnlocked =
          ongoingTimeUnitEntry.timeUnit.value >= request.unlockTimeUnit.value;

        const unlockTimestamp = timeUnitToMilliseconds(
          chain.id,
          request.unlockTimeUnit,
        );

        return {
          unlockId: request.unlockId,
          amount: request.amount,

          unlockTimestamp,
          // TODO: Using dummy address for now.
          address:
            '0x1234567890abcdef1234567890abcdef123456789' as AnySubstrateAddress,
          unlockDurationHasElapsed: hasUnlocked,
          currency: request.currency,
          decimals: chain.decimals,
        };
      });
  }, [ongoingTimeUnits, tokenUnlockLedger]);

  return rows;
};

export default useLstUnlockRequestTableRows;
