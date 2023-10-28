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
  IconWithTooltip,
  IconsGroup,
  KeyValueWithButton,
  Table,
  TitleWithInfo,
  Typography,
  formatTokenAmount,
  fuzzyFilter,
  shortenString,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';

import { EmptyTable, LoadingTable } from '../../../components/tables';
import { downloadNotes } from '../../../utils';
import { ActionWithTooltip } from '../ActionWithTooltip';
import { MoreOptionsDropdown } from '../MoreOptionsDropdown';
import useNoteAction from '../useNoteAction';
import { SpendNoteDataType, SpendNotesTableContainerProps } from './types';

const columnHelper = createColumnHelper<SpendNoteDataType>();

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
      const fungibleTokenSymbol = props.getValue<string>();
      const tokenUrl = props.row.original.assetsUrl;

      return (
        <div className="flex items-center space-x-1.5">
          <Typography variant="body1" fw="bold">
            {fungibleTokenSymbol}
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

  columnHelper.accessor('balance', {
    header: 'Balance',
    cell: (props) => (
      <Typography variant="body1" fw="bold">
        {formatTokenAmount(props.getValue().toString())}
      </Typography>
    ),
  }),

  columnHelper.accessor('subsequentDeposits', {
    header: () => (
      <span className="inline-block w-full text-center">
        Subsequent Deposits
      </span>
    ),
    cell: (props) => (
      <Typography ta="center" variant="body1">
        {props.getValue()}
      </Typography>
    ),
  }),

  columnHelper.accessor('note', {
    header: () => (
      <TitleWithInfo title="Spend Note" info="Spend note" variant="body1" />
    ),
    cell: (props) => (
      <div className="flex items-center">
        <KeyValueWithButton
          shortenFn={(note: string) => shortenString(note, 4)}
          isHiddenLabel
          size="sm"
          keyValue={props.getValue()}
        />
      </div>
    ),
  }),
] as const;

export const SpendNotesTableContainer: FC<SpendNotesTableContainerProps> = ({
  data = [],
  onDeleteNotesChange,
  onUploadSpendNote,
  globalSearchText,
}) => {
  const { isSyncingNote } = useNoteAccount();

  const noteActionHandler = useNoteAction();

  const columns = useMemo(() => {
    return [
      ...staticColumns,

      columnHelper.accessor('assetsUrl', {
        header: '',
        cell: (props) => {
          const data = props.row.original;

          return (
            <div className="flex items-center space-x-1">
              <ActionWithTooltip
                tooltipContent="Quick Transfer"
                onClick={() =>
                  noteActionHandler(
                    'transfer',
                    data.rawChain,
                    data.rawFungibleCurrency
                  )
                }
              >
                <SendPlanLineIcon className="!fill-current" />
              </ActionWithTooltip>

              <ActionWithTooltip
                tooltipContent="Quick Withdraw"
                onClick={() =>
                  noteActionHandler(
                    'withdraw',
                    data.rawChain,
                    data.rawFungibleCurrency
                  )
                }
              >
                <WalletLineIcon className="!fill-current" />
              </ActionWithTooltip>

              <MoreOptionsDropdown
                onDownloadNotes={() => downloadNotes([data.rawNote])}
                onDeleteNotes={() => onDeleteNotesChange?.([data.rawNote])}
              />
            </div>
          );
        },
      }),
    ];
  }, [noteActionHandler, onDeleteNotesChange]);

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
        tdClassName="min-w-max"
        tableProps={table}
        isPaginated
        totalRecords={data.length}
        title="notes"
      />
    </div>
  );
};
