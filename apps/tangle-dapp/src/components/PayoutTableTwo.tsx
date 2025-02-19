import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { PayoutTwo } from '@tangle-network/tangle-shared-ui/types';
import {
  AmountFormatStyle,
  Avatar,
  CopyWithTooltip,
  Table,
  Typography,
  shortenString,
  ExternalLinkIcon,
} from '@tangle-network/ui-components';
import { type FC, useMemo, useState } from 'react';

import { HeaderCell, StringCell } from './tableCells';
import TokenAmountCell from './tableCells/TokenAmountCell';
import sortByBn from '../utils/sortByBn';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import PayoutTxModal from '../containers/PayoutTxContainer';
import { WalletPayIcon } from '@tangle-network/icons';

const COLUMN_HELPER = createColumnHelper<PayoutTwo>();

type Props = {
  /** Array of payout data to display */
  data?: PayoutTwo[];
  /** Number of rows to display per page */
  pageSize: number;
  /** Optional className for additional styling */
  className?: string;
  /** Current session progress */
  sessionProgress?: {
    /** Current era index */
    currentEra: number;
    /** Current era progress */
    eraProgress: number;
    /** Era length in blocks */
    eraLength: number;
    /** Session length in blocks */
    sessionLength: number;
  };
  /** History depth in eras */
  historyDepth?: number;
  /** Epoch duration in blocks */
  epochDuration?: number;
};

const PayoutTableTwo: FC<Props> = ({
  data = [],
  pageSize,
  className,
  sessionProgress,
  historyDepth,
  epochDuration,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [payoutTxProps, setPayoutTxProps] = useState<PayoutTwo | null>(null);

  // Default sort by highest reward
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'totalReward', desc: true },
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
          // Sort eras in ascending order
          const sortedEras = [...eras].sort((a, b) => a - b);

          // Format display: single era or first-last
          const displayValue =
            sortedEras.length === 1
              ? sortedEras[0].toString()
              : `${sortedEras[0]}-${sortedEras[sortedEras.length - 1]}`;

          return <StringCell value={displayValue} className="text-start" />;
        },
      }),
      COLUMN_HELPER.accessor('validator', {
        header: () => (
          <HeaderCell title="Validator" className="justify-start" />
        ),
        cell: (props) => {
          const { address, identity } = props.getValue();
          const displayName = identity || shortenString(address, 6);

          const accountExplorerUrl = createExplorerAccountUrl(address);

          return (
            <div
              className="flex items-center justify-start space-x-2"
              key={address}
            >
              <Avatar sourceVariant="address" value={address} theme="substrate">
                {address}
              </Avatar>

              <Typography variant="body1" fw="normal" className="truncate">
                {displayName}
              </Typography>

              <CopyWithTooltip
                copyLabel="Copy Validator Address"
                textToCopy={address}
                isButton={false}
              />

              {accountExplorerUrl !== null && (
                <ExternalLinkIcon
                  href={accountExplorerUrl}
                  className="fill-mono-160 dark:fill-mono-80"
                />
              )}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const { identity: identityA = '' } = rowA.original.validator;
          const { identity: identityB = '' } = rowB.original.validator;
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
      COLUMN_HELPER.accessor('eras', {
        id: 'remainingTime',
        header: () => (
          <HeaderCell title="Remaining Time" className="justify-start" />
        ),
        cell: (props) => {
          const eras = props.getValue();
          if (!sessionProgress || !historyDepth || !epochDuration) {
            return <StringCell value="-" className="text-start" />;
          }

          // Get the oldest era from the array
          const oldestEra = Math.min(...eras);

          // We need to use epochDuration since eraLength is not available
          if (!epochDuration) {
            return <StringCell value="-" className="text-start" />;
          }

          // Calculate remaining eras until expiry
          const erasPassed = sessionProgress.currentEra - oldestEra;
          const remainingEras = Math.max(0, historyDepth - erasPassed);

          // Calculate blocks until end of current era
          const blocksInCurrentEra =
            epochDuration - sessionProgress.eraProgress;

          // Calculate total remaining blocks
          // Include blocks in current era + blocks in remaining full eras
          const remainingBlocks =
            blocksInCurrentEra + (remainingEras - 1) * epochDuration;

          // Calculate remaining time in seconds (6 second blocks for Substrate)
          const remainingSeconds = Math.max(0, remainingBlocks * 6);

          // If already expired
          if (remainingSeconds === 0) {
            return (
              <StringCell value="+0s" className="text-start text-warning" />
            );
          }

          let displayValue = '';
          if (remainingSeconds < 60) {
            displayValue = `+${remainingSeconds}s`;
          } else if (remainingSeconds < 3600) {
            const minutes = Math.floor(remainingSeconds / 60);
            displayValue = `+${minutes}m`;
          } else {
            const hours = Math.floor(remainingSeconds / 3600);
            displayValue = `+${hours}h`;
          }

          return (
            <StringCell
              value={displayValue}
              className="text-start text-warning"
            />
          );
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
                  eras: rowData.eras,
                  validator: rowData.validator,
                  totalReward: rowData.totalReward,
                  totalRewardFormatted: rowData.totalRewardFormatted,
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
    [createExplorerAccountUrl, epochDuration, historyDepth, sessionProgress],
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
        className={`overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160 ${className || ''}`}
      >
        <Table
          tableProps={table}
          isPaginated
          totalRecords={data.length}
          title="Unclaimed Payouts"
        />
      </div>

      {payoutTxProps !== null && (
        <PayoutTxModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          payout={payoutTxProps}
        />
      )}
    </>
  );
};

export default PayoutTableTwo;
