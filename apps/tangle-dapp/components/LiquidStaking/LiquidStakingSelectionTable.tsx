import { Column, SortingColumn } from '@tanstack/react-table';
import { ArrowDropDownFill, ArrowDropUpFill } from '@webb-tools/icons';
import { Dispatch, FC, SetStateAction, useRef } from 'react';

import { useLiquidStakingSelectionTableColumns } from '../../hooks/LiquidStaking/useLiquidStakingSelectionTableColumns';
import { LiquidStakingItem, StakingItem } from '../../types/liquidStaking';

interface LiquidStakingSelectionTableProps<T extends StakingItem> {
  data: T[];
  dataType: LiquidStakingItem;
  setSelectedItems: Dispatch<SetStateAction<Set<string>>>;
}

export const LiquidStakingSelectionTable = <T extends StakingItem>({
  data,
  dataType,
  setSelectedItems,
}: LiquidStakingSelectionTableProps<T>) => {
  console.debug(
    'Liquid Staking Selection Table:',
    data,
    dataType,
    setSelectedItems,
  );

  const toggleSortSelectionHandlerRef = useRef<
    SortingColumn<any>['toggleSorting'] | null
  >(null);

  const columns = useLiquidStakingSelectionTableColumns(
    toggleSortSelectionHandlerRef,
    dataType,
  );

  console.debug('Columns:', columns);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Validator</th>
            <th>Total Staked</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  );
};

/** @internal */
export const SortArrow: FC<{ column: Column<any, any> }> = ({ column }) => {
  const isSorted = column.getIsSorted();

  if (!isSorted) {
    return null;
  }

  return isSorted === 'asc' ? (
    <ArrowDropUpFill className="cursor-pointer" size="lg" />
  ) : (
    <ArrowDropDownFill className="cursor-pointer" size="lg" />
  );
};
