import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChainIcon,
  ExternalLinkLine,
  SendPlanLineIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import { useNoteAccount } from '@webb-tools/react-hooks';
import {
  HiddenValue,
  IconWithTooltip,
  IconsGroup,
  Table,
  Typography,
  formatTokenAmount,
  fuzzyFilter,
  numberToString,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';

import { EmptyTable, LoadingTable } from '../../../components/tables/index.js';
import { downloadNotes } from '../../../utils/index.js';
import { ActionWithTooltip } from '../ActionWithTooltip.js';
import { MoreOptionsDropdown } from '../MoreOptionsDropdown.js';
import useNoteAction from '../useNoteAction.js';
import {
  ShieldedAssetDataType,
  ShieldedAssetsTableContainerProps,
} from './types.js';
import { parseEther } from 'viem';

const columnHelper = createColumnHelper<ShieldedAssetDataType>();

const staticColumns = [
  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: (props) => (
      <div className="flex items-center">
        <IconWithTooltip
          icon={<ChainIcon size="lg" name={props.getValue<string>()} />}
          content={props.getValue<string>()}
        />
      </div>
    ),
  }),

  columnHelper.accessor('fungibleTokenSymbol', {
    header: 'Shielded Asset',
    cell: (props) => {
      const assetSymbol = props.getValue<string>();
      const tokenUrl = props.row.original.assetsUrl;

      return (
        <div className="flex items-center space-x-1.5">
          <Typography variant="body1" fw="bold">
            {assetSymbol}
          </Typography>

          <a href={tokenUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLinkLine />
          </a>
        </div>
      );
    },
  }),

  columnHelper.accessor('composition', {
    header: 'Composition',
    cell: (props) => {
      const composition = props.getValue<string[]>();
      if (!composition.length) {
        return (
          <Typography
            className="inline-block"
            variant="body1"
            fw="semibold"
            ta="center"
          >
            No composition
          </Typography>
        );
      }

      return <IconsGroup icons={composition} type="token" />;
    },
  }),

  columnHelper.accessor('availableBalance', {
    header: 'Balance',
    cell: (props) => (
      <Typography variant="body1" fw="bold">
        <HiddenValue>
          {formatTokenAmount(props.getValue().toString())}
        </HiddenValue>
      </Typography>
    ),
  }),

  columnHelper.accessor('numberOfNotesFound', {
    header: 'Notes Found',
    cell: (props) => (
      <Typography
        variant="body1"
        fw="bold"
        className="text-blue-70 dark:text-blue-50"
      >
        {props.getValue()}
      </Typography>
    ),
  }),
] as const;

export const ShieldedAssetsTableContainer: FC<
  ShieldedAssetsTableContainerProps
> = ({
  data = [],
  onDeleteNotesChange,
  onUploadSpendNote,
  globalSearchText,
}) => {
  const { isSyncingNote } = useNoteAccount();

  const noteActionHandler = useNoteAction();

  const columns = useMemo(
    () => [
      ...staticColumns,

      columnHelper.accessor('assetsUrl', {
        header: 'Action',
        cell: (props) => {
          const shieldedAsset = props.row.original;

          return (
            <div className="flex items-center space-x-1">
              <ActionWithTooltip
                tooltipContent="Transfer"
                onClick={() =>
                  noteActionHandler(
                    'transfer',
                    shieldedAsset.rawChain,
                    shieldedAsset.rawFungibleCurrency,
                    parseEther(numberToString(shieldedAsset.availableBalance))
                  )
                }
              >
                <SendPlanLineIcon className="!fill-current" />
              </ActionWithTooltip>

              <ActionWithTooltip
                tooltipContent="Withdraw"
                onClick={() =>
                  noteActionHandler(
                    'withdraw',
                    shieldedAsset.rawChain,
                    shieldedAsset.rawFungibleCurrency,
                    parseEther(numberToString(shieldedAsset.availableBalance))
                  )
                }
              >
                <WalletLineIcon className="!fill-current" />
              </ActionWithTooltip>

              <MoreOptionsDropdown
                onDownloadNotes={() => downloadNotes(shieldedAsset.rawNotes)}
                onDeleteNotes={() =>
                  onDeleteNotesChange?.(shieldedAsset.rawNotes)
                }
              />
            </div>
          );
        },
      }),
    ],
    [onDeleteNotesChange, noteActionHandler]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: globalSearchText,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isSyncingNote) {
    return <LoadingTable />;
  }

  if (!data.length) {
    return (
      <EmptyTable
        title="Shielded Assets"
        description="When you make a deposit, you'll see your shielded assets here."
        buttonText="Upload a spend note."
        onClick={onUploadSpendNote}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180">
      <Table
        thClassName="border-t-0 bg-mono-0 dark:bg-mono-160"
        tableProps={table}
        isPaginated
        totalRecords={data.length}
        title="assets"
      />
    </div>
  );
};
