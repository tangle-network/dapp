'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { WalletPayIcon } from '@webb-tools/icons';
import {
  Avatar,
  AvatarGroup,
  CopyWithTooltip,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC, useState } from 'react';

import PayoutTxContainer from '../../containers/PayoutTxContainer/PayoutTxContainer';
import { AddressWithIdentity, Payout } from '../../types';
import { HeaderCell, StringCell } from '../tableCells';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import { PayoutTableProps } from './types';

const columnHelper = createColumnHelper<Payout>();

const PayoutTable: FC<PayoutTableProps> = ({
  data = [],
  pageSize,
  updateData,
  sessionProgress,
  historyDepth,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [payoutTxProps, setPayoutTxProps] = useState<{
    validatorAddress: string;
    era: number;
  }>({
    // TODO: Should be using `null` for both values. Avoid using empty strings to circumvent TypeScript type checking.
    validatorAddress: '',
    era: 0,
  });

  const table = useReactTable({
    data,
    columns: [
      columnHelper.accessor('era', {
        header: () => <HeaderCell title="Era" className="justify-start" />,
        cell: (props) => {
          return <StringCell value={props.getValue()} className="text-start" />;
        },
      }),
      columnHelper.accessor('validator', {
        header: () => (
          <HeaderCell title="Validator" className="justify-start" />
        ),
        cell: (props) => {
          const address = props.getValue().address;
          const identity = props.getValue().identity;

          return (
            <div
              className="flex items-center justify-start space-x-1"
              key={`${props.row.original.era}-${address}`}
            >
              <Avatar sourceVariant="address" value={address} theme="substrate">
                {address}
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
          );
        },
      }),
      columnHelper.accessor('validatorTotalStake', {
        header: () => (
          <HeaderCell title="Total Stake" className="justify-start" />
        ),
        cell: (props) => (
          <TokenAmountCell amount={props.getValue()} className="text-start" />
        ),
      }),
      columnHelper.accessor('nominators', {
        header: () => (
          <HeaderCell title="Nominators" className="justify-start" />
        ),
        cell: (props) => {
          const nominators: AddressWithIdentity[] = props.getValue();

          return (
            <AvatarGroup total={nominators.length}>
              {nominators.map((nominator) => (
                <Avatar
                  key={nominator.address}
                  sourceVariant="address"
                  value={nominator.address}
                  theme="substrate"
                />
              ))}
            </AvatarGroup>
          );
        },
      }),
      columnHelper.accessor('validatorTotalReward', {
        header: () => (
          <HeaderCell title="Total Rewards" className="justify-start" />
        ),
        cell: (props) => (
          <TokenAmountCell amount={props.getValue()} className="text-start" />
        ),
      }),
      columnHelper.accessor('nominatorTotalReward', {
        header: () => (
          <HeaderCell title="Your Rewards" className="justify-start" />
        ),
        cell: (props) => {
          return (
            <TokenAmountCell amount={props.getValue()} className="text-start" />
          );
        },
      }),
      columnHelper.display({
        id: 'remaining',
        header: () => (
          <HeaderCell title="Remaining Eras" className="justify-center" />
        ),
        cell: (props) => {
          const rowData = props.row.original;

          const remainingErasToClaim = Math.abs(
            sessionProgress && historyDepth
              ? sessionProgress.currentEra.toNumber() -
                  historyDepth.toNumber() -
                  rowData.era
              : 0,
          );

          return (
            <StringCell
              value={sessionProgress ? `${remainingErasToClaim}` : 'N/A'}
              className="text-center"
            />
          );
        },
      }),
      columnHelper.display({
        id: 'claim',
        header: () => <HeaderCell title="Actions" className="justify-center" />,
        cell: (props) => {
          const rowData = props.row.original;

          return (
            <button
              onClick={() => {
                setPayoutTxProps({
                  validatorAddress: rowData.validator.address,
                  era: rowData.era,
                });
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center w-full"
            >
              <WalletPayIcon />
            </button>
          );
        },
      }),
    ],
    initialState: {
      pagination: {
        pageSize,
      },
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160">
        <Table
          thClassName="border-t-0 bg-mono-0"
          paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
          tableProps={table}
          isPaginated
          totalRecords={data.length}
        />
      </div>

      <PayoutTxContainer
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        payoutTxProps={payoutTxProps}
        payouts={data}
        updatePayouts={updateData}
      />
    </>
  );
};

export default PayoutTable;
