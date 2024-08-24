import assert from 'assert';
import { useMemo } from 'react';

import { LS_PARACHAIN_CHAIN_MAP } from '../../../constants/liquidStaking/constants';
import { LsSimpleParachainTimeUnit } from '../../../constants/liquidStaking/types';
import useLstUnlockRequests from '../../../data/liquidStaking/useLstUnlockRequests';
import useOngoingTimeUnits from '../../../data/liquidStaking/useOngoingTimeUnits';
import { ParachainUnstakeRequest } from './UnstakeRequestsTable';

const useLstUnlockRequestTableRows = () => {
  const tokenUnlockLedger = useLstUnlockRequests();
  const ongoingTimeUnits = useOngoingTimeUnits();

  const rows = useMemo<ParachainUnstakeRequest[] | null>(() => {
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
        const chain = Object.values(LS_PARACHAIN_CHAIN_MAP).find(
          (chain) => chain.currency === request.currency,
        );

        assert(
          chain !== undefined,
          'All currencies should be linked to a defined chain',
        );

        const ongoingTimeUnitEntry = ongoingTimeUnits.find(
          (ongoingTimeUnit) =>
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

        const remainingTimeUnit: LsSimpleParachainTimeUnit | undefined =
          remainingTimeUnitValue <= 0
            ? undefined
            : {
                unit: request.unlockTimeUnit.unit,
                value: remainingTimeUnitValue,
              };

        return {
          type: 'parachainUnstakeRequest',
          unlockId: request.unlockId,
          amount: request.amount,
          currency: request.currency,
          decimals: chain.decimals,
          progress: remainingTimeUnit,
        } satisfies ParachainUnstakeRequest;
      });
  }, [ongoingTimeUnits, tokenUnlockLedger]);

  return rows;
};

export default useLstUnlockRequestTableRows;
