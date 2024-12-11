import { BN } from '@polkadot/util';
import { useMemo } from 'react';

import { RestakingService } from '../../types';
import { AllocationChartVariant } from './AllocationChart';
import { filterAllocations } from './Independent/IndependentAllocationStep';
import { RestakingAllocationMap } from './types';

export type AllocationChartEntryName =
  | 'Remaining'
  | 'New Allocation'
  | RestakingService;

export type AllocationChartEntry = {
  name: AllocationChartEntryName;
  value: number;
};

const useAllocationChartEntries = (
  allocations: RestakingAllocationMap,
  _allocatedAmount: BN,
  variant: AllocationChartVariant,
) => {
  const previewEntry: AllocationChartEntry = useMemo(() => {
    // Set value to 0 if the preview amount is not provided
    // or if the max restaking amount is still loading.
    const value = 0;

    return {
      name: 'New Allocation',
      value,
    };
  }, []);

  const remainingEntry: AllocationChartEntry = useMemo(() => {
    const previewPercentage = previewEntry?.value ?? 0;

    const percentage = previewPercentage;

    return {
      name: 'Remaining',
      value: 1 - percentage,
    };
  }, [previewEntry?.value]);

  const allocationEntries: AllocationChartEntry[] = useMemo(
    () =>
      filterAllocations(allocations).map(([service]) => ({
        name: service,
        value: 0,
      })),
    [allocations],
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
