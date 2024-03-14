import { BN } from '@polkadot/util';
import assert from 'assert';
import { useMemo } from 'react';

import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import { ServiceType } from '../../types';
import { AllocationChartVariant } from './AllocationChart';
import { filterAllocations } from './IndependentAllocationStep';
import { RestakingAllocationMap } from './types';

export type AllocationChartEntryName =
  | 'Remaining'
  | 'New Allocation'
  | ServiceType;

export type AllocationChartEntry = {
  name: AllocationChartEntryName;
  value: number;
};

/**
 * Given an amount, calculate its percentage of a total amount.
 *
 * The resulting percentage will be a Number with 2 decimal places,
 * ex. `0.67`, ranging from 0 to 1.
 *
 * This is useful for integrating BN numbers into visual representation,
 * such as when working with Recharts to chart BN amount allocations,
 * since Recharts does not natively support BNs as data inputs.
 *
 * Because of the possible loss in precision, this utility function is
 * only suitable for use in the UI.
 */
function getPercentageOfTotal(amount: BN, total: BN): number {
  assert(
    !total.isZero(),
    'Total should not be zero, otherwise division by zero would occur'
  );

  assert(amount.lte(total), 'Amount should be less than or equal to total');

  const scaledAmount = amount.mul(new BN(100));
  const percentageString = scaledAmount.div(total).toString();

  // Converting the string to a number ensures that the conversion to
  // number never fails, but it may result in a loss of precision for
  // extremely large values.
  const percentage = Number(percentageString) / 100;

  // Round the percentage to 2 decimal places. It's suitable to use
  // 2 decimal places since the purpose of this function is to provide
  // a visual representation of the percentage in the UI.
  return Math.round(percentage * 100) / 100;
}

const useAllocationChartEntries = (
  allocations: RestakingAllocationMap,
  allocatedAmount: BN,
  variant: AllocationChartVariant,
  previewAmount: BN | undefined
) => {
  const { maxRestakingAmount } = useRestakingLimits();

  const previewEntry: AllocationChartEntry = useMemo(() => {
    // Set value to 0 if the preview amount is not provided
    // or if the max restaking amount is still loading.
    const value =
      previewAmount === undefined || maxRestakingAmount === null
        ? 0
        : getPercentageOfTotal(previewAmount, maxRestakingAmount);

    return {
      name: 'New Allocation',
      value,
    };
  }, [maxRestakingAmount, previewAmount]);

  const remainingEntry: AllocationChartEntry = useMemo(() => {
    if (maxRestakingAmount === null) {
      return {
        name: 'Remaining',
        value: 1,
      };
    }

    const previewPercentage = previewEntry?.value ?? 0;

    const percentage =
      getPercentageOfTotal(allocatedAmount, maxRestakingAmount) +
      previewPercentage;

    return {
      name: 'Remaining',
      value: 1 - percentage,
    };
  }, [maxRestakingAmount, allocatedAmount, previewEntry?.value]);

  const allocationEntries: AllocationChartEntry[] = useMemo(
    () =>
      filterAllocations(allocations).map(([service, amount]) => ({
        name: service,
        value:
          maxRestakingAmount === null
            ? 0
            : getPercentageOfTotal(amount, maxRestakingAmount),
      })),
    [allocations, maxRestakingAmount]
  );

  // For the independent variant, use both the remaining data
  // entry, and the allocations. For the shared variant, use
  // either: If no allocations, show the remaining balance,
  // otherwise use the allocations as data entries.
  const entries: AllocationChartEntry[] = useMemo(() => {
    if (variant === AllocationChartVariant.INDEPENDENT) {
      // Do not include the preview as an entry if its value
      // is 0, otherwise it will take up some 'ghost' space in
      // because of the separation between chart sections.
      const pre =
        previewEntry.value === 0
          ? [remainingEntry]
          : [remainingEntry, previewEntry];

      return pre.concat(allocationEntries);
    }
    // The profile type is shared.
    else {
      // No allocations; show the remaining section.
      if (allocationEntries.length === 0) {
        return [
          {
            name: 'Remaining',
            // Ensure that the remaining entry never has a value of 0,
            // otherwise Recharts will not show the bar.
            value: remainingEntry.value > 0 ? remainingEntry.value : 1,
          },
        ];
      }

      return allocationEntries.map(({ name }) => ({
        name,
        // Use a value of `1` so that Recharts shows the bar.
        // This value doesn't matter much, since shared profiles
        // do not set their amounts per-role, but rather as a whole.
        value: 1,
      }));
    }
  }, [allocationEntries, previewEntry, remainingEntry, variant]);

  return { entries, allocationEntries };
};

export default useAllocationChartEntries;
