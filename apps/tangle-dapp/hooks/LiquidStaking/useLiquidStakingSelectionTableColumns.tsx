import { createColumnHelper, Row } from '@tanstack/react-table';
import {
  Avatar,
  CheckBox,
  CopyWithTooltip,
  ExternalLinkIcon,
  shortenString,
  Typography,
} from '@webb-tools/webb-ui-components';
import { useMemo } from 'react';
import React from 'react';

import { SortArrow } from '../../components/LiquidStaking/LiquidStakingSelectionTable';
import { StatsGraphButton } from '../../components/LiquidStaking/StatsGraphButton';
import { LiquidStakingItem, Validator } from '../../types/liquidStaking';
import calculateCommission from '../../utils/calculateCommission';
import formatBn from '../../utils/formatBn';

const validatorColumnHelper = createColumnHelper<Validator>();

export const useLiquidStakingSelectionTableColumns = (
  toggleSortSelectionHandlerRef: React.MutableRefObject<
    ((desc?: boolean | undefined, isMulti?: boolean | undefined) => void) | null
  >,
  liquidStakingItem: LiquidStakingItem,
) => {
  console.debug('Liquid Staking Selection Table Columns:', liquidStakingItem);
  const validatorColumns = useMemo(() => {
    return [
      validatorColumnHelper.accessor('validatorAddress', {
        header: ({ header }) => {
          toggleSortSelectionHandlerRef.current = header.column.toggleSorting;
          return (
            <Typography
              variant="body2"
              fw="semibold"
              className="text-mono-120 dark:text-mono-120"
            >
              Validator
            </Typography>
          );
        },
        cell: (props) => {
          const address = props.getValue();
          const identity = props.row.original.validatorIdentity ?? address;

          return (
            <div className="flex items-center gap-2">
              <CheckBox
                wrapperClassName="!block !min-h-auto cursor-pointer"
                className="cursor-pointer"
                isChecked={props.row.getIsSelected()}
                onChange={props.row.getToggleSelectedHandler()}
              />

              <div className="flex items-center space-x-1">
                <Avatar
                  sourceVariant="address"
                  value={address}
                  theme="substrate"
                />

                <Typography
                  variant="body2"
                  fw="normal"
                  className="truncate text-mono-200 dark:text-mono-0"
                >
                  {identity === address ? shortenString(address, 6) : identity}
                </Typography>

                <CopyWithTooltip
                  textToCopy={address}
                  isButton={false}
                  className="cursor-pointer"
                />

                <ExternalLinkIcon href="" />
              </div>
            </div>
          );
        },
        sortingFn: (rowA: Row<Validator>, rowB: Row<Validator>) => {
          const rowASelected = rowA.getIsSelected();
          const rowBSelected = rowB.getIsSelected();

          if (rowASelected && !rowBSelected) {
            return -1;
          }

          if (!rowASelected && rowBSelected) {
            return 1;
          }

          return 0;
        },
      }),
      validatorColumnHelper.accessor('totalValueStaked', {
        header: ({ header }) => (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={header.column.getToggleSortingHandler()}
          >
            <Typography
              variant="body2"
              fw="semibold"
              className="text-mono-120 dark:text-mono-120"
            >
              {' '}
              Total Staked
            </Typography>

            <SortArrow column={header.column} />
          </div>
        ),
        cell: (props) => (
          <div className="flex items-center justify-center">
            <Typography
              variant="body2"
              fw="normal"
              className="text-mono-200 dark:text-mono-0"
            >
              {formatBn(props.getValue(), props.row.original.chainDecimals) +
                ` ${props.row.original.chainTokenSymbol}`}
            </Typography>
          </div>
        ),
        sortingFn: (rowA: Row<Validator>, rowB: Row<Validator>) => {
          const rowAValue = Number(rowA.original.totalValueStaked);
          const rowBValue = Number(rowB.original.totalValueStaked);

          return rowAValue - rowBValue;
        },
      }),
      validatorColumnHelper.accessor('validatorCommission', {
        header: ({ header }) => (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={header.column.getToggleSortingHandler()}
          >
            <Typography
              variant="body2"
              fw="semibold"
              className="text-mono-120 dark:text-mono-120"
            >
              {' '}
              Commission
            </Typography>

            <SortArrow column={header.column} />
          </div>
        ),
        cell: (props) => (
          <div className="flex items-center justify-center">
            <Typography
              variant="body2"
              fw="normal"
              className="text-mono-200 dark:text-mono-0"
            >
              {calculateCommission(props.getValue()).toFixed(2) + '%'}
            </Typography>
          </div>
        ),
        sortingFn: (rowA: Row<Validator>, rowB: Row<Validator>) => {
          const rowAValue = Number(rowA.original.validatorCommission);
          const rowBValue = Number(rowB.original.validatorCommission);

          return rowAValue - rowBValue;
        },
      }),
      validatorColumnHelper.accessor('validatorAPY', {
        header: () => <span></span>,
        cell: () => {
          return <StatsGraphButton href="" />;
        },
      }),
    ];
  }, [toggleSortSelectionHandlerRef]);

  const columns = useMemo(() => {
    switch (liquidStakingItem) {
      case LiquidStakingItem.VALIDATOR:
        return validatorColumns;
      case LiquidStakingItem.VAULT_OR_STAKE_POOL:
        return [];
      case LiquidStakingItem.DAPP:
        return [];
    }
  }, [liquidStakingItem, validatorColumns]);

  return columns;
};
