import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChainIcon,
  ExternalLinkLine,
  SendPlanLineIcon,
  TokenIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import { useNoteAccount } from '@webb-tools/react-hooks';
import {
  fuzzyFilter,
  IconWithTooltip,
  KeyValueWithButton,
  shortenString,
  Table,
  TitleWithInfo,
  TokenPairIcons,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';

import { EmptyTable, LoadingTable } from '../../../components/tables';
import { downloadNotes } from '../../../utils';
import { ActionWithTooltip } from '../ActionWithTooltip';
import { MoreOptionsDropdown } from '../MoreOptionsDropdown';
import { SpendNoteDataType, SpendNotesTableContainerProps } from './types';

const columnHelper = createColumnHelper<SpendNoteDataType>();

const staticColumns: ColumnDef<SpendNoteDataType, any>[] = [
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
          <Typography className="uppercase" variant="body1" fw="bold">
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
        return null;
      }

      const firstTwoTokens = composition.slice(0, 2);
      const numOfHiddenTokens = composition.length - 2;

      return (
        <div className="flex items-center space-x-1">
          {firstTwoTokens.length === 1 ? (
            <IconWithTooltip
              icon={<TokenIcon size="lg" name={firstTwoTokens[0]} />}
              content={firstTwoTokens[0]}
            />
          ) : (
            <TokenPairIcons
              token1Symbol={firstTwoTokens[0]}
              token2Symbol={firstTwoTokens[1]}
            />
          )}

          {numOfHiddenTokens > 0 && (
            <Typography className="inline-block" variant="body3">
              +{numOfHiddenTokens} others
            </Typography>
          )}
        </div>
      );
    },
  }),

  columnHelper.accessor('balance', {
    header: 'Balance',
    cell: (props) => (
      <Typography variant="body1" fw="bold">
        {props.getValue()}
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
];

export const SpendNotesTableContainer: FC<SpendNotesTableContainerProps> = ({
  data = [],
  onActiveTabChange,
  onDefaultDestinationChainChange,
  onDefaultFungibleCurrencyChange,
  onDeleteNotesChange,
  onUploadSpendNote,
}) => {
  const { isSyncingNote } = useNoteAccount();

  const onQuickTransfer = useCallback(
    (data: SpendNoteDataType) => {
      const { rawChain, rawFungibleCurrency } = data;

      onActiveTabChange?.('Transfer');

      onDefaultDestinationChainChange?.(rawChain);

      if (rawFungibleCurrency) {
        onDefaultFungibleCurrencyChange?.(rawFungibleCurrency);
      }
    },
    [
      onActiveTabChange,
      onDefaultDestinationChainChange,
      onDefaultFungibleCurrencyChange,
    ]
  );

  const onQuickWithdraw = useCallback(
    (data: SpendNoteDataType) => {
      const { rawChain, rawFungibleCurrency } = data;

      onActiveTabChange?.('Withdraw');

      onDefaultDestinationChainChange?.(rawChain);

      if (rawFungibleCurrency) {
        onDefaultFungibleCurrencyChange?.(rawFungibleCurrency);
      }
    },
    [
      onActiveTabChange,
      onDefaultDestinationChainChange,
      onDefaultFungibleCurrencyChange,
    ]
  );

  const columns = useMemo<Array<ColumnDef<SpendNoteDataType, any>>>(() => {
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
                onClick={() => onQuickTransfer(data)}
              >
                <SendPlanLineIcon className="!fill-current" />
              </ActionWithTooltip>

              <ActionWithTooltip
                tooltipContent="Quick Withdraw"
                onClick={() => onQuickWithdraw(data)}
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
  }, [onDeleteNotesChange, onQuickTransfer, onQuickWithdraw]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  if (isSyncingNote) {
    return <LoadingTable />;
  }

  if (!data.length) {
    return (
      <EmptyTable
        title="No spend notes found"
        description="Your notes are stored locally as you transact and encrypted on-chain for persistent storage. Don't see your assets?"
        buttonText="Upload spend Notes"
        onClick={onUploadSpendNote}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180">
      <Table
        thClassName="border-t-0 bg-mono-0 dark:bg-mono-160"
        tdClassName="min-w-max"
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
        title="notes"
      />
    </div>
  );
};
