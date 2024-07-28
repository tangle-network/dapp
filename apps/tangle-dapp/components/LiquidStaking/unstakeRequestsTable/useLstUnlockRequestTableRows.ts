import assert from 'assert';
import { useMemo } from 'react';

import {
  LIQUID_STAKING_CHAINS,
  SimpleTimeUnitInstance,
} from '../../../constants/liquidStaking';
import useLstUnlockRequests from '../../../data/liquidStaking/useLstUnlockRequests';
import useOngoingTimeUnits from '../../../data/liquidStaking/useOngoingTimeUnits';
import { AnySubstrateAddress } from '../../../types/utils';
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

        assert(
          ongoingTimeUnitEntry !== undefined,
          'Ongoing time unit should be set if user was able to mint and redeem LSTs',
        );

        assert(
          ongoingTimeUnitEntry.timeUnit.unit === request.unlockTimeUnit.unit,
          'The time unit of the ongoing time unit should match the time unit of the unlock request',
        );

        const remainingTimeUnitValue =
          request.unlockTimeUnit.value - ongoingTimeUnitEntry.timeUnit.value;

        const remainingTimeUnit: SimpleTimeUnitInstance | undefined =
          remainingTimeUnitValue < 0
            ? undefined
            : {
                unit: request.unlockTimeUnit.unit,
                value: remainingTimeUnitValue,
              };

        return {
          unlockId: request.unlockId,
          amount: request.amount,
          // TODO: Using dummy address for now.
          address:
            '0x1234567890abcdef1234567890abcdef123456789' as AnySubstrateAddress,
          currency: request.currency,
          decimals: chain.decimals,
          remainingTimeUnit,
        } satisfies UnstakeRequestTableRow;
      });
  }, [ongoingTimeUnits, tokenUnlockLedger]);

  return rows;
};

export default useLstUnlockRequestTableRows;
