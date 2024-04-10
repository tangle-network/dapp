'use client';

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

import { ContainerSkeleton } from '../../components';
import { Validator } from '../../types';
import { HeaderCell } from '../tableCells';
import { SortableKeys, SortBy, ValidatorListTableProps } from './types';

const columnHelper = createColumnHelper<Validator>();

export const ValidatorListTable: FC<ValidatorListTableProps> = ({
  data,
  selectedValidators,
  setSelectedValidators,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [totalStakeSortBy, setTotalStakeSortBy] = useState<SortBy>('dsc');
  const [nominationsSortBy, setNominationsSortBy] = useState<SortBy>('dsc');
  const [commissionSortBy, setCommissionSortBy] = useState<SortBy>('dsc');
  const [sortBy, setSortBy] = useState<SortableKeys>('effectiveAmountStaked');

  const sortedData = useMemo(() => {
    const selectedData = data.filter((validator) =>
      selectedValidators.includes(validator.address)
    );
    const unselectedData = data.filter(
      (validator) => !selectedValidators.includes(validator.address)
    );

    const sortData = (
      data: Validator[],
      sortBy: SortableKeys,
      sortOrder: SortBy
    ) => {
      return [...data].sort((a, b) => {
        const valueA = sortOrder === 'asc' ? a[sortBy] : b[sortBy];
        const valueB = sortOrder === 'asc' ? b[sortBy] : a[sortBy];
        return parseFloat(valueA) - parseFloat(valueB);
      });
    };

    const sortedSelectedData = sortData(
      selectedData,
      sortBy,
      sortBy === 'effectiveAmountStaked'
        ? totalStakeSortBy
        : sortBy === 'delegations'
        ? nominationsSortBy
        : commissionSortBy
    );

    const sortedUnselectedData = sortData(
      unselectedData,
      sortBy,
      sortBy === 'effectiveAmountStaked'
        ? totalStakeSortBy
        : sortBy === 'delegations'
        ? nominationsSortBy
        : commissionSortBy
    );

    return [...sortedSelectedData, ...sortedUnselectedData];
  }, [
    data,
    selectedValidators,
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
            .includes(searchValue.toLowerCase()) ||
          validator.address.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue, sortedData]
  );

  const handleValidatorToggle = useCallback(
    (address: string, isSelected: boolean) => {
      if (isSelected) {
        setSelectedValidators(
          selectedValidators.filter(
            (selectedValidator) => selectedValidator !== address
          )
        );
      } else {
        setSelectedValidators([...selectedValidators, address]);
      }
    },
    [selectedValidators, setSelectedValidators]
  );

  const columns = [
    columnHelper.accessor('address', {
      header: () => <HeaderCell title="Validator" className="justify-start" />,
      cell: (props) => {
        const address = props.getValue();
        const identity = props.row.original.identityName;

        return (
          <div className="flex items-center gap-2">
            <CheckBox
              wrapperClassName="!block !min-h-auto cursor-pointer"
              className="cursor-pointer"
              isChecked={selectedValidators.includes(address)}
              onChange={() =>
                handleValidatorToggle(
                  address,
                  selectedValidators.includes(address)
                )
              }
            />

            <div className="flex space-x-1 items-center">
              <Avatar sourceVariant="address" value={address} theme="substrate">
                hello
              </Avatar>

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
    columnHelper.accessor('effectiveAmountStaked', {
      header: () => (
        <div className="flex items-center justify-center">
          <HeaderCell title="Total Staked" className="block flex-none" />

          {totalStakeSortBy === 'asc' ? (
            <ArrowDropDownFill
              className="cursor-pointer"
              size="lg"
              onClick={() => {
                setTotalStakeSortBy('dsc');
                setSortBy('effectiveAmountStaked');
              }}
            />
          ) : (
            <ArrowDropUpFill
              className="cursor-pointer"
              size="lg"
              onClick={() => {
                setTotalStakeSortBy('asc');
                setSortBy('effectiveAmountStaked');
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
    columnHelper.accessor('delegations', {
      header: () => (
        <div className="flex items-center justify-center">
          <HeaderCell title="Nominations" className="block flex-none" />

          {nominationsSortBy === 'asc' ? (
            <ArrowDropDownFill
              className="cursor-pointer"
              size="lg"
              onClick={() => {
                setNominationsSortBy('dsc');
                setSortBy('delegations');
              }}
            />
          ) : (
            <ArrowDropUpFill
              className="cursor-pointer"
              size="lg"
              onClick={() => {
                setNominationsSortBy('asc');
                setSortBy('delegations');
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
          <Chip color="dark-grey">{Number(props.getValue()).toFixed(2)}%</Chip>
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
        value={searchValue}
        onChange={(val) => setSearchValue(val)}
        className="mb-1"
      />

      {filteredData.length === 0 ? (
        <ContainerSkeleton className="max-h-[340px] w-full" />
      ) : (
        <Table
          thClassName="border-t-0 py-3 sticky top-0"
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
