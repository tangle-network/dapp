import { DeriveSessionProgress } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { WalletPayIcon } from '@webb-tools/icons';
import {
  AddressWithIdentity,
  Payout,
} from '@webb-tools/tangle-shared-ui/types';
import {
  AmountFormatStyle,
  Avatar,
  AvatarGroup,
  CopyWithTooltip,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { type FC, useState } from 'react';

import { HeaderCell, StringCell } from './tableCells';
import TokenAmountCell from './tableCells/TokenAmountCell';
import sortByBn from '../utils/sortByBn';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import PayoutTxModal from '../containers/PayoutTxContainer';

const COLUMN_HELPER = createColumnHelper<Payout>();

type Props = {
  data?: Payout[];
  pageSize: number;
  sessionProgress: DeriveSessionProgress | null;
  historyDepth: BN | null;
  epochDuration: number | null;
};

type PayoutTxProps = {
  validatorAddress: SubstrateAddress;
  era: number;
};

const PayoutTable: FC<Props> = ({
  data = [],
  pageSize,
  sessionProgress,
  historyDepth,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([
    // Default sorting by era in descending order.
    { id: 'era' satisfies keyof PayoutTxProps, desc: true },
  ]);

  const [payoutTxProps, setPayoutTxProps] = useState<PayoutTxProps | null>(
    null,
  );

  const table = useReactTable({
    data,
    columns: [
      COLUMN_HELPER.accessor('era', {
        header: () => <HeaderCell title="Era" className="justify-start" />,
        cell: (props) => {
          return <StringCell value={props.getValue()} className="text-start" />;
        },
      }),
      COLUMN_HELPER.accessor('validator', {
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
                copyLabel="Copy Address"
                textToCopy={address}
                isButton={false}
              />
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const { address: addressA, identity: identityA } =
            rowA.original.validator;
          const { address: addressB, identity: identityB } =
            rowB.original.validator;
          const sortingValueA = identityA === addressA ? addressA : identityA;
          const sortingValueB = identityB === addressB ? addressB : identityB;
          return sortingValueB.localeCompare(sortingValueA);
        },
      }),
      COLUMN_HELPER.accessor('validatorTotalStake', {
        header: () => (
          <HeaderCell title="Total Stake" className="justify-start" />
        ),
        cell: (props) => (
          <TokenAmountCell
            amount={props.getValue()}
            formatStyle={AmountFormatStyle.SHORT}
          />
        ),
        sortingFn: sortByBn((row) => row.validatorTotalStake),
      }),
      COLUMN_HELPER.accessor('nominators', {
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
        enableSorting: false,
      }),
      COLUMN_HELPER.accessor('validatorTotalReward', {
        header: () => (
          <HeaderCell title="Total Rewards" className="justify-start" />
        ),
        cell: (props) => (
          <TokenAmountCell
            amount={props.getValue()}
            formatStyle={AmountFormatStyle.SHORT}
          />
        ),
        sortingFn: sortByBn((row) => row.validatorTotalReward),
      }),
      COLUMN_HELPER.accessor('nominatorTotalReward', {
        header: () => (
          <HeaderCell title="Your Rewards" className="justify-start" />
        ),
        cell: (props) => {
          return <TokenAmountCell amount={props.getValue()} />;
        },
        sortingFn: sortByBn((row) => row.nominatorTotalReward),
      }),
      COLUMN_HELPER.display({
        id: 'remaining',
        header: () => (
          <HeaderCell title="Remaining Eras" className="justify-start" />
        ),
        cell: (props) => {
          const rowData = props.row.original;

          const remainingErasToClaim = calculateRemainingErasToClaim(
            sessionProgress,
            historyDepth,
            rowData.era,
          );

          return (
            <StringCell
              value={sessionProgress ? `${remainingErasToClaim}` : 'N/A'}
              className="text-start"
            />
          );
        },
        sortingFn: (rowA, rowB) => {
          const remainingErasToClaimA = calculateRemainingErasToClaim(
            sessionProgress,
            historyDepth,
            rowA.original.era,
          );

          const remainingErasToClaimB = calculateRemainingErasToClaim(
            sessionProgress,
            historyDepth,
            rowB.original.era,
          );

          return remainingErasToClaimA - remainingErasToClaimB;
        },
      }),
      COLUMN_HELPER.display({
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
        enableSorting: false,
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
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    enableSortingRemoval: false,
  });

  return (
    <>
      <div className="overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160">
        <Table
          tableProps={table}
          isPaginated
          totalRecords={data.length}
          title={pluralize('payout', data.length !== 1)}
        />
      </div>

      {payoutTxProps !== null && (
        <PayoutTxModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          payoutTxProps={payoutTxProps}
          payouts={data}
        />
      )}
    </>
  );
};

export default PayoutTable;

function calculateRemainingErasToClaim(
  sessionProgress: DeriveSessionProgress | null,
  historyDepth: BN | null,
  era: number,
) {
  return Math.abs(
    sessionProgress && historyDepth
      ? sessionProgress.currentEra.toNumber() - historyDepth.toNumber() - era
      : 0,
  );
}
