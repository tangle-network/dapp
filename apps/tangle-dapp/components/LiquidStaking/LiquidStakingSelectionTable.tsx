import { Column, SortingColumn } from '@tanstack/react-table';
import { ArrowDropDownFill, ArrowDropUpFill } from '@webb-tools/icons';
import { Dispatch, FC, SetStateAction, useRef } from 'react';

import { useLiquidStakingSelectionTableColumns } from '../../hooks/LiquidStaking/useLiquidStakingSelectionTableColumns';
import {
  Dapp,
  LiquidStakingItem,
  Validator,
  VaultOrStakePool,
} from '../../types/liquidStaking';

type LiquidStakingSelectionTableProps = {
  data: Validator[] | VaultOrStakePool[] | Dapp[];
  dataType: LiquidStakingItem;
  setSelectedItems: Dispatch<SetStateAction<Set<string>>>;
};

export const LiquidStakingSelectionTable = ({
  data,
  dataType,
  setSelectedItems,
}: LiquidStakingSelectionTableProps) => {
  const toggleSortSelectionHandlerRef = useRef<
    SortingColumn<any>['toggleSorting'] | null
  >(null);

  const columns = useLiquidStakingSelectionTableColumns(
    toggleSortSelectionHandlerRef,
    dataType,
  );

  console.debug('LS', data, columns, setSelectedItems);

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
