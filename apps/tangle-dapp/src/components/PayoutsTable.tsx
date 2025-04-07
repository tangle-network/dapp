import { WalletPayIcon } from '@tangle-network/icons';
import HeaderCell from '@tangle-network/tangle-shared-ui/components/tables/HeaderCell';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { Payout } from '@tangle-network/tangle-shared-ui/types';
import {
  AmountFormatStyle,
  Table,
  ValidatorIdentity,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import PayoutTxModal from '../containers/PayoutTxModal';
import sortByBn from '../utils/sortByBn';
import { StringCell } from './tableCells';
import TokenAmountCell from './tableCells/TokenAmountCell';

const COLUMN_HELPER = createColumnHelper<Payout>();

type Props = {
  data?: Payout[];
  className?: string;
  pageSize?: number;
  onPayoutSuccess?: () => void;
};

const PayoutsTable: React.FC<Props> = ({
  data = [],
  className,
  pageSize,
  onPayoutSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutTxProps, setPayoutTxProps] = useState<Payout | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'totalReward' satisfies keyof Payout, desc: true },
  ]);

  const createExplorerAccountUrl = useNetworkStore(
    (store) => store.network.createExplorerAccountUrl,
  );

  const columns = useMemo(
    () => [
      COLUMN_HELPER.accessor('eras', {
        header: () => <HeaderCell title="Eras" className="justify-start" />,
        cell: (props) => {
          const eras = props.getValue();
          if (!eras || eras.length === 0) {
            return <StringCell value="-" className="text-start" />;
          }
          const displayEras =
            eras.length === 1
              ? `${eras[0]}`
              : `${eras[0]}-${eras[eras.length - 1]}`;
          return <StringCell value={displayEras} className="text-start" />;
        },
      }),
      COLUMN_HELPER.accessor('validator', {
        header: () => (
          <HeaderCell title="Validator" className="justify-start" />
        ),
        cell: (props) => {
          const { address, identity } = props.getValue();

          const accountExplorerUrl = address
            ? createExplorerAccountUrl(address)
            : null;

          if (address === null) {
            return null;
          }

          return (
            <ValidatorIdentity
              address={address}
              identityName={identity}
              accountExplorerUrl={accountExplorerUrl}
            />
          );
        },
        sortingFn: (rowA, rowB) => {
          const { identity: identityA } = rowA.original.validator;
          const { identity: identityB } = rowB.original.validator;

          if (!identityA) {
            return -1;
          }

          if (!identityB) {
            return 1;
          }

          return identityA.localeCompare(identityB);
        },
      }),
      COLUMN_HELPER.accessor('totalReward', {
        header: () => (
          <HeaderCell title="Your Total Reward" className="justify-start" />
        ),
        cell: (props) => (
          <TokenAmountCell
            amount={props.getValue()}
            formatStyle={AmountFormatStyle.SHORT}
          />
        ),
        sortingFn: sortByBn((row) => row.totalReward),
      }),
      COLUMN_HELPER.display({
        id: 'claim',
        header: () => <HeaderCell title="Actions" className="justify-center" />,
        cell: (props) => {
          const rowData = props.row.original;

          return (
            <button
              onClick={() => {
                const payout = {
                  eras: rowData.eras,
                  validator: rowData.validator,
                  totalReward: rowData.totalReward,
                  totalRewardFormatted: rowData.totalRewardFormatted,
                };
                setPayoutTxProps(payout);
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
    [createExplorerAccountUrl],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    defaultColumn: {
      enableSorting: true,
    },
    initialState: {
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
  });

  return (
    <>
      <div
        className={twMerge(
          'overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160',
          className,
        )}
      >
        <Table
          tableProps={table}
          isPaginated
          totalRecords={data.length}
          title={pluralize('Unclaimed Payout', data.length !== 1)}
        />
      </div>

      {payoutTxProps && (
        <PayoutTxModal
          isModalOpen={isModalOpen}
          setIsModalOpen={(open) => {
            setIsModalOpen(open);
            if (!open) setPayoutTxProps(null);
          }}
          payout={payoutTxProps}
          onSuccess={onPayoutSuccess}
        />
      )}
    </>
  );
};

export default PayoutsTable;
