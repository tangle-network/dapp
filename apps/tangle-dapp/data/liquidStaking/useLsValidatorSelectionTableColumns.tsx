import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  Row,
  SortingFnOption,
} from '@tanstack/react-table';
import {
  Avatar,
  CheckBox,
  Chip,
  CopyWithTooltip,
  shortenString,
  Typography,
} from '@webb-tools/webb-ui-components';
import { useMemo } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { StakingItemExternalLinkButton } from '../../components/LiquidStaking/StakingItemExternalLinkButton';
import TokenAmountCell from '../../components/tableCells/TokenAmountCell';
import {
  Collator,
  Dapp,
  LiquidStakingItem,
  PhalaVaultOrStakePool,
  Validator,
} from '../../types/liquidStaking';
import calculateCommission from '../../utils/calculateCommission';
import formatBn from '../../utils/formatBn';
import formatFractional from '../../utils/formatFractional';

const validatorColumnHelper = createColumnHelper<Validator>();
const dappColumnHelper = createColumnHelper<Dapp>();

const vaultOrStakePoolColumnHelper =
  createColumnHelper<PhalaVaultOrStakePool>();

const collatorColumnHelper = createColumnHelper<Collator>();

export const useLsValidatorSelectionTableColumns = (
  toggleSortSelectionHandlerRef: React.MutableRefObject<
    ((desc?: boolean | undefined, isMulti?: boolean | undefined) => void) | null
  >,
  liquidStakingItem: LiquidStakingItem,
) => {
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
                  {identity === address ? shortenString(address, 8) : identity}
                </Typography>

                <CopyWithTooltip textToCopy={address} isButton={false} />
              </div>
            </div>
          );
        },
        sortingFn: sortSelected as SortingFnOption<Validator>,
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
              Total Staked
            </Typography>
          </div>
        ),
        cell: (props) => (
          <TokenAmountCell
            amount={props.getValue()}
            decimals={props.row.original.chainDecimals}
            symbol={props.row.original.chainTokenSymbol}
          />
        ),
        sortingFn: sortValueStaked,
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
              Commission
            </Typography>
          </div>
        ),
        cell: (props) => (
          <div className="flex items-center justify-start">
            <Typography
              variant="body2"
              fw="normal"
              className="text-mono-200 dark:text-mono-0"
            >
              {formatFractional(calculateCommission(props.getValue()))}
            </Typography>
          </div>
        ),
        sortingFn: sortCommission as SortingFnOption<Validator>,
      }),
      validatorColumnHelper.accessor('href', {
        header: () => <span></span>,
        cell: (props) => {
          return <StakingItemExternalLinkButton href={props.getValue()} />;
        },
      }),
    ];
  }, [toggleSortSelectionHandlerRef]);

  const dappColumns = useMemo(() => {
    return [
      dappColumnHelper.accessor('dappContractAddress', {
        header: ({ header }) => {
          toggleSortSelectionHandlerRef.current = header.column.toggleSorting;
          return (
            <Typography
              variant="body2"
              fw="semibold"
              className="text-mono-120 dark:text-mono-120"
            >
              dApp
            </Typography>
          );
        },
        cell: (props) => {
          const address = props.getValue();
          const isEthAddress = address.startsWith('0x');
          const dappName = props.row.original.dappName;

          return (
            <div className="flex items-center gap-2">
              <RadioInput
                checked={props.row.getIsSelected()}
                onChange={props.row.getToggleSelectedHandler()}
              />

              <div className="flex items-center space-x-1">
                <Avatar
                  sourceVariant="address"
                  value={address}
                  theme={isEthAddress ? 'ethereum' : 'substrate'}
                />

                <Typography
                  variant="body2"
                  fw="normal"
                  className="truncate text-mono-200 dark:text-mono-0"
                >
                  {dappName === address ? shortenString(address, 8) : dappName}
                </Typography>

                <CopyWithTooltip textToCopy={address} isButton={false} />
              </div>
            </div>
          );
        },
        sortingFn: sortSelected as SortingFnOption<Dapp>,
      }),
      dappColumnHelper.accessor('totalValueStaked', {
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
              Total Staked
            </Typography>
          </div>
        ),
        cell: (props) => (
          <TokenAmountCell
            amount={props.getValue()}
            decimals={props.row.original.chainDecimals}
            symbol={props.row.original.chainTokenSymbol}
          />
        ),
        sortingFn: sortValueStaked,
      }),
      dappColumnHelper.accessor('href', {
        header: () => <span></span>,
        cell: (props) => {
          return <StakingItemExternalLinkButton href={props.getValue()} />;
        },
      }),
    ];
  }, [toggleSortSelectionHandlerRef]);

  const vaultOrStakePoolColumns = useMemo(() => {
    return [
      vaultOrStakePoolColumnHelper.accessor('vaultOrStakePoolID', {
        header: ({ header }) => {
          toggleSortSelectionHandlerRef.current = header.column.toggleSorting;
          return (
            <Typography
              variant="body2"
              fw="semibold"
              className="text-mono-120 dark:text-mono-120"
            >
              Vault/Pool ID
            </Typography>
          );
        },
        cell: (props) => {
          const id = props.getValue();
          const accountID = props.row.original.vaultOrStakePoolAccountID;

          return (
            <div className="flex items-center gap-2">
              <RadioInput
                checked={props.row.getIsSelected()}
                onChange={props.row.getToggleSelectedHandler()}
              />

              <div className="flex items-center space-x-1">
                <Avatar
                  sourceVariant="address"
                  value={accountID}
                  theme="substrate"
                />

                <Typography
                  variant="body2"
                  fw="normal"
                  className="truncate text-mono-200 dark:text-mono-0"
                >
                  #{id}
                </Typography>

                <CopyWithTooltip textToCopy={id} isButton={false} />
              </div>
            </div>
          );
        },
        sortingFn: sortSelected as SortingFnOption<PhalaVaultOrStakePool>,
      }),
      vaultOrStakePoolColumnHelper.accessor('type', {
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
              Type
            </Typography>
          </div>
        ),
        cell: (props) => {
          const type = props.getValue();

          return (
            <div className="flex items-center justify-center">
              <Chip color={type === 'vault' ? 'green' : 'blue'}>{type}</Chip>
            </div>
          );
        },
        sortingFn: sortType,
      }),
      vaultOrStakePoolColumnHelper.accessor('totalValueStaked', {
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
              Total Staked
            </Typography>
          </div>
        ),
        cell: (props) => (
          <TokenAmountCell
            amount={props.getValue()}
            decimals={props.row.original.chainDecimals}
            symbol={props.row.original.chainTokenSymbol}
          />
        ),
        sortingFn: sortValueStaked,
      }),
      vaultOrStakePoolColumnHelper.accessor('commission', {
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
              Commission
            </Typography>
          </div>
        ),
        cell: (props) => (
          <div className="flex items-center justify-center">
            <Typography
              variant="body2"
              fw="normal"
              className="text-mono-200 dark:text-mono-0"
            >
              {(Number(props.getValue().toString()) / 10_000).toFixed(2)}%
            </Typography>
          </div>
        ),
        sortingFn: sortCommission as SortingFnOption<PhalaVaultOrStakePool>,
      }),
      vaultOrStakePoolColumnHelper.accessor('href', {
        header: () => <span></span>,
        cell: (props) => {
          return <StakingItemExternalLinkButton href={props.getValue()} />;
        },
      }),
    ];
  }, [toggleSortSelectionHandlerRef]);

  const collatorColumns = useMemo(() => {
    return [
      collatorColumnHelper.accessor('collatorAddress', {
        header: ({ header }) => {
          toggleSortSelectionHandlerRef.current = header.column.toggleSorting;
          return (
            <Typography
              variant="body2"
              fw="semibold"
              className="text-mono-120 dark:text-mono-120"
            >
              Collator
            </Typography>
          );
        },
        cell: (props) => {
          const address = props.getValue();
          const isEthAddress = address.startsWith('0x');
          const identity = props.row.original.collatorIdentity ?? address;

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
                  theme={isEthAddress ? 'ethereum' : 'substrate'}
                />

                <Typography
                  variant="body2"
                  fw="normal"
                  className="truncate text-mono-200 dark:text-mono-0"
                >
                  {identity === address ? shortenString(address, 8) : identity}
                </Typography>

                <CopyWithTooltip textToCopy={address} isButton={false} />
              </div>
            </div>
          );
        },
        sortingFn: sortSelected as SortingFnOption<Collator>,
      }),
      collatorColumnHelper.accessor('totalValueStaked', {
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
              Total Staked
            </Typography>
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
        sortingFn: sortValueStaked,
      }),
      collatorColumnHelper.accessor('collatorDelegationCount', {
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
              Delegations
            </Typography>
          </div>
        ),
        cell: (props) => (
          <div className="flex items-center justify-center">
            <Typography
              variant="body2"
              fw="normal"
              className="text-mono-200 dark:text-mono-0"
            >
              {props.getValue()}
            </Typography>
          </div>
        ),
        sortingFn: sortDelegationCount as SortingFnOption<Collator>,
      }),
      collatorColumnHelper.accessor('href', {
        header: () => <span></span>,
        cell: (props) => {
          return <StakingItemExternalLinkButton href={props.getValue()} />;
        },
      }),
    ];
  }, [toggleSortSelectionHandlerRef]);

  const columns = useMemo(() => {
    switch (liquidStakingItem) {
      case LiquidStakingItem.VALIDATOR:
        return validatorColumns;
      case LiquidStakingItem.VAULT_OR_STAKE_POOL:
        return vaultOrStakePoolColumns;
      case LiquidStakingItem.DAPP:
        return dappColumns;
      case LiquidStakingItem.COLLATOR:
        return collatorColumns;
    }
  }, [
    dappColumns,
    collatorColumns,
    liquidStakingItem,
    validatorColumns,
    vaultOrStakePoolColumns,
  ]);

  return columns;
};

/** @internal */
const RadioInput: React.FC<{
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ checked, onChange }) => {
  return (
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      className={twMerge(
        'w-[18px] h-[18px] rounded-full bg-mono-0 dark:bg-mono-180 border border-mono-100',
        'enabled:hover:bg-blue-10 enabled:hover:dark:bg-blue-120',
        'enabled:hover:border-blue-40 enabled:hover:dark:border-blue-90',
        'enabled:hover:shadow-[0_0_0_1px_rgba(213,230,255,1)] hover:dark:shadow-none',
        'cursor-pointer',
      )}
    />
  );
};

export default RadioInput;

/**
 * Function to sort rows based on their selected status.
 * Selected rows are sorted to appear before non-selected rows.
 */

const sortSelected = <T extends { getIsSelected: () => boolean }>(
  rowA: Row<T>,
  rowB: Row<T>,
) => {
  const rowASelected = rowA.getIsSelected();
  const rowBSelected = rowB.getIsSelected();
  return rowASelected === rowBSelected ? 0 : rowASelected ? -1 : 1;
};

/**
 * Function to sort rows based on the total value staked.
 * Rows with higher staked values are sorted before those with lower values.
 */
const sortValueStaked = <T extends { totalValueStaked: BN }>(
  rowA: Row<T>,
  rowB: Row<T>,
) => {
  const rowAValue = rowA.original.totalValueStaked;
  const rowBValue = rowB.original.totalValueStaked;
  return Number(rowAValue.sub(rowBValue).toString());
};

/**
 * Function to sort rows based on commission values.
 * Rows with lower commission values are sorted before those with higher values.
 */
const sortCommission = <
  T extends { validatorCommission?: BN; commission?: BN },
>(
  rowA: Row<T>,
  rowB: Row<T>,
) => {
  const rowAValue =
    Number(rowA.original.validatorCommission) ||
    Number(rowA.original.commission);
  const rowBValue =
    Number(rowB.original.validatorCommission) ||
    Number(rowB.original.commission);
  return rowAValue - rowBValue;
};

/**
 * Function to sort rows based on the number of delegations for collators.
 * Rows with fewer delegations are sorted before those with more delegations.
 */
const sortDelegationCount = <T extends { collatorDelegationCount: number }>(
  rowA: Row<T>,
  rowB: Row<T>,
) => {
  const rowAValue = rowA.original.collatorDelegationCount;
  const rowBValue = rowB.original.collatorDelegationCount;
  return rowAValue - rowBValue;
};

/**
 * Function to sort rows based on type.
 * Uses localeCompare for string comparison to ensure proper alphabetical order.
 */
const sortType = <T extends { type: string }>(rowA: Row<T>, rowB: Row<T>) => {
  const rowAType = rowA.original.type;
  const rowBType = rowB.original.type;
  return rowAType.localeCompare(rowBType);
};
