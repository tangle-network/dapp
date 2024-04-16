'use client';

import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDropDownFill, ArrowDropUpFill, Search } from '@webb-tools/icons';
import {
  Avatar,
  CheckBox,
  Chip,
  CopyWithTooltip,
  fuzzyFilter,
  Input,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import React, { FC, useCallback, useMemo, useState } from 'react';

import { Validator } from '../../types';
import calculateCommission from '../../utils/calculateCommission';
import { ContainerSkeleton } from '..';
import { HeaderCell } from '../tableCells';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import { SortableKeys, SortBy, ValidatorSelectionTableProps } from './types';

const columnHelper = createColumnHelper<Validator>();

export const ValidatorSelectionTable: FC<ValidatorSelectionTableProps> = ({
  validators,
  selectedValidatorAddresses,
  setSelectedValidatorAddresses,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [totalStakeSortBy, setTotalStakeSortBy] = useState<SortBy>('dsc');
  const [nominationsSortBy, setNominationsSortBy] = useState<SortBy>('dsc');
  const [commissionSortBy, setCommissionSortBy] = useState<SortBy>('dsc');
  const [sortBy, setSortBy] = useState<SortableKeys>('totalStakeAmount');

  const sortedData = useMemo(() => {
    const selectedValidators = validators.filter((validator) =>
      selectedValidatorAddresses.includes(validator.address)
    );

    const unselectedValidators = validators.filter(
      (validator) => !selectedValidatorAddresses.includes(validator.address)
    );

    const sortValidators = (
      validators: Validator[],
      sortBy: SortableKeys,
      sortOrder: SortBy
    ) => {
      return [...validators].sort((a, b) => {
        const valueA = sortOrder === 'asc' ? a[sortBy] : b[sortBy];
        const valueB = sortOrder === 'asc' ? b[sortBy] : a[sortBy];

        return new BN(valueA).cmp(new BN(valueB));
      });
    };

    const sortedSelectedValidators = sortValidators(
      selectedValidators,
      sortBy,
      sortBy === 'totalStakeAmount'
        ? totalStakeSortBy
        : sortBy === 'nominatorCount'
        ? nominationsSortBy
        : commissionSortBy
    );

    const sortedUnselectedValidators = sortValidators(
      unselectedValidators,
      sortBy,
      sortBy === 'totalStakeAmount'
        ? totalStakeSortBy
        : sortBy === 'nominatorCount'
        ? nominationsSortBy
        : commissionSortBy
    );

    return [...sortedSelectedValidators, ...sortedUnselectedValidators];
  }, [
    validators,
    selectedValidatorAddresses,
    sortBy,
    totalStakeSortBy,
    nominationsSortBy,
    commissionSortBy,
  ]);

  const filteredData = useMemo(
    () =>
      sortedData.filter(
        (validator) =>
          validator.identityName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          validator.address.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, sortedData]
  );

  const handleValidatorToggle = useCallback(
    (address: string, isSelected: boolean) => {
      if (isSelected) {
        setSelectedValidatorAddresses(
          selectedValidatorAddresses.filter(
            (selectedValidator) => selectedValidator !== address
          )
        );
      } else {
        setSelectedValidatorAddresses([...selectedValidatorAddresses, address]);
      }
    },
    [selectedValidatorAddresses, setSelectedValidatorAddresses]
  );

  const columns = [
    columnHelper.accessor('address', {
      header: () => <HeaderCell title="Validator" className="justify-start" />,
      cell: (props) => {
        const address = props.getValue();
        const identity = props.row.original.identityName;

        return (
          <div
            onClick={() =>
              handleValidatorToggle(
                address,
                selectedValidatorAddresses.includes(address)
              )
            }
            className="flex items-center gap-2"
          >
            <CheckBox
              wrapperClassName="!block !min-h-auto cursor-pointer"
              className="cursor-pointer"
              isChecked={selectedValidatorAddresses.includes(address)}
              onChange={() =>
                handleValidatorToggle(
                  address,
                  selectedValidatorAddresses.includes(address)
                )
              }
            />

            <div className="flex space-x-1 items-center">
              <Avatar
                sourceVariant="address"
                value={address}
                theme="substrate"
              />

              <Typography variant="body1" fw="normal" className="truncate">
                {identity === address ? shortenString(address, 6) : identity}
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
    }),
    columnHelper.accessor('totalStakeAmount', {
      header: () => (
        <div className="flex items-center justify-center">
          <HeaderCell title="Total Staked" className="block flex-none" />

          {totalStakeSortBy === 'asc' ? (
            <ArrowDropDownFill
              className="cursor-pointer"
              size="lg"
              onClick={() => {
                setTotalStakeSortBy('dsc');
                setSortBy('totalStakeAmount');
              }}
            />
          ) : (
            <ArrowDropUpFill
              className="cursor-pointer"
              size="lg"
              onClick={() => {
                setTotalStakeSortBy('asc');
                setSortBy('totalStakeAmount');
              }}
            />
          )}
        </div>
      ),
      cell: (props) => (
        <div className="flex items-center justify-center">
          <Chip color="dark-grey">
            <TokenAmountCell
              className="text-mono-0"
              typographyVariant="body4"
              typographyFontWeight="bold"
              amount={props.getValue()}
            />
          </Chip>
        </div>
      ),
    }),
    columnHelper.accessor('nominatorCount', {
      header: () => (
        <div className="flex items-center justify-center">
          <HeaderCell title="Nominations" className="block flex-none" />

          {nominationsSortBy === 'asc' ? (
            <ArrowDropDownFill
              className="cursor-pointer"
              size="lg"
              onClick={() => {
                setNominationsSortBy('dsc');
                setSortBy('nominatorCount');
              }}
            />
          ) : (
            <ArrowDropUpFill
              className="cursor-pointer"
              size="lg"
              onClick={() => {
                setNominationsSortBy('asc');
                setSortBy('nominatorCount');
              }}
            />
          )}
        </div>
      ),
      cell: (props) => (
        <div className="flex items-center justify-center">
          <Chip color="dark-grey">{props.getValue()}</Chip>
        </div>
      ),
    }),
    columnHelper.accessor('commission', {
      header: () => (
        <div className="flex items-center justify-center">
          <HeaderCell title="Commission" className="block flex-none" />

          {commissionSortBy === 'asc' ? (
            <ArrowDropDownFill
              className="cursor-pointer"
              size="lg"
              onClick={() => {
                setCommissionSortBy('dsc');
                setSortBy('commission');
              }}
            />
          ) : (
            <ArrowDropUpFill
              className="cursor-pointer"
              size="lg"
              onClick={() => {
                setCommissionSortBy('asc');
                setSortBy('commission');
              }}
            />
          )}
        </div>
      ),
      cell: (props) => (
        <div className="flex items-center justify-center">
          <Chip color="dark-grey">
            {calculateCommission(props.getValue()).toFixed(2)}%
          </Chip>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col gap-2">
      <Input
        id="token"
        rightIcon={<Search className="mr-2" />}
        placeholder="Search validators..."
        value={searchQuery}
        onChange={(val) => setSearchQuery(val)}
        className="mb-1"
      />

      {filteredData.length === 0 ? (
        <ContainerSkeleton className="max-h-[340px] w-full" />
      ) : (
        <Table
          // TODO: For some reason, there is a slight pixel gap between the table and the header. For now, solving this issue by using a negative top position.
          thClassName="border-t-0 py-3 sticky top-[-1px] z-10"
          trClassName="cursor-pointer"
          tdClassName="py-2 border-t-0"
          paginationClassName="bg-mono-0 dark:bg-mono-180 p-2"
          tableWrapperClassName="max-h-[340px] overflow-y-scroll"
          tableProps={table}
          isPaginated
        />
      )}
    </div>
  );
};
