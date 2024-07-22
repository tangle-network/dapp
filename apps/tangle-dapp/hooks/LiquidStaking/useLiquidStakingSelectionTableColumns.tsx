import { createColumnHelper, Row } from '@tanstack/react-table';
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

import { SortArrow } from '../../components/LiquidStaking/LiquidStakingSelectionTable';
import { StakingItemExternalLinkButton } from '../../components/LiquidStaking/StakingItemExternalLinkButton';
import {
  Dapp,
  LiquidStakingItem,
  Validator,
  Collator,
  VaultOrStakePool,
} from '../../types/liquidStaking';
import calculateCommission from '../../utils/calculateCommission';
import formatBn from '../../utils/formatBn';

const validatorColumnHelper = createColumnHelper<Validator>();
const dappColumnHelper = createColumnHelper<Dapp>();
const vaultOrStakePoolColumnHelper = createColumnHelper<VaultOrStakePool>();
const collatorColumnHelper = createColumnHelper<Collator>();

export const useLiquidStakingSelectionTableColumns = (
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

                <CopyWithTooltip
                  textToCopy={address}
                  isButton={false}
                  className="cursor-pointer"
                />
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
          const rowAValue = rowA.original.totalValueStaked;
          const rowBValue = rowB.original.totalValueStaked;

          return Number(rowAValue.sub(rowBValue).toString());
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

                <CopyWithTooltip
                  textToCopy={address}
                  isButton={false}
                  className="cursor-pointer"
                />
              </div>
            </div>
          );
        },
        sortingFn: (rowA: Row<Dapp>, rowB: Row<Dapp>) => {
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
        sortingFn: (rowA: Row<Dapp>, rowB: Row<Dapp>) => {
          const rowAValue = rowA.original.totalValueStaked;
          const rowBValue = rowB.original.totalValueStaked;

          return Number(rowAValue.sub(rowBValue).toString());
        },
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

                <CopyWithTooltip
                  textToCopy={id}
                  isButton={false}
                  className="cursor-pointer"
                />
              </div>
            </div>
          );
        },
        sortingFn: (
          rowA: Row<VaultOrStakePool>,
          rowB: Row<VaultOrStakePool>,
        ) => {
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

            <SortArrow column={header.column} />
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
        sortingFn: (
          rowA: Row<VaultOrStakePool>,
          rowB: Row<VaultOrStakePool>,
        ) => {
          const rowAType = rowA.original.type;
          const rowBType = rowB.original.type;

          return rowAType.localeCompare(rowBType);
        },
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
        sortingFn: (
          rowA: Row<VaultOrStakePool>,
          rowB: Row<VaultOrStakePool>,
        ) => {
          const rowAValue = rowA.original.totalValueStaked;
          const rowBValue = rowB.original.totalValueStaked;

          return Number(rowAValue.sub(rowBValue).toString());
        },
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
              {(Number(props.getValue().toString()) / 10000).toFixed(2)}%
            </Typography>
          </div>
        ),
        sortingFn: (
          rowA: Row<VaultOrStakePool>,
          rowB: Row<VaultOrStakePool>,
        ) => {
          const rowAValue = Number(rowA.original.commission);
          const rowBValue = Number(rowB.original.commission);

          return rowAValue - rowBValue;
        },
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

                <CopyWithTooltip
                  textToCopy={address}
                  isButton={false}
                  className="cursor-pointer"
                />
              </div>
            </div>
          );
        },
        sortingFn: (rowA: Row<Collator>, rowB: Row<Collator>) => {
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
        sortingFn: (rowA: Row<Collator>, rowB: Row<Collator>) => {
          const rowAValue = rowA.original.totalValueStaked;
          const rowBValue = rowB.original.totalValueStaked;

          return Number(rowAValue.sub(rowBValue).toString());
        },
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
              {props.getValue()}
            </Typography>
          </div>
        ),
        sortingFn: (rowA: Row<Collator>, rowB: Row<Collator>) => {
          const rowAValue = Number(rowA.original.collatorDelegationCount);
          const rowBValue = Number(rowB.original.collatorDelegationCount);

          return rowAValue - rowBValue;
        },
      }),
      // collatorColumnHelper.accessor('href', {
      //   header: () => <span></span>,
      //   cell: (props) => {
      //     return <StakingItemExternalLinkButton href={props.getValue()} />;
      //   },
      // }),
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
