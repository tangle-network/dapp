import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChainIcon,
  ChevronDown,
  ExternalLinkLine,
  SendPlanLineIcon,
  WalletLineIcon,
  TokenIcon,
} from '@webb-tools/icons';
import { useNoteAccount } from '@webb-tools/react-hooks';
import {
  Button,
  fuzzyFilter,
  IconWithTooltip,
  KeyValueWithButton,
  shortenString,
  Table,
  TokenPairIcons,
  Typography,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components';
import { FC, PropsWithChildren, useCallback, useMemo } from 'react';
import { EmptyTable, LoadingTable } from '../../components/tables';
import { SpendNoteDataType, SpendNotesTableContainerProps } from './types';

const columnHelper = createColumnHelper<SpendNoteDataType>();

const staticColumns: ColumnDef<SpendNoteDataType, any>[] = [
  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: (props) => (
      <div className="flex items-center justify-center">
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
        <div className="flex items-center justify-center space-x-1.5">
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
        <div className="flex items-center justify-center space-x-1">
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
      <Typography variant="body1" fw="bold" ta="center">
        {props.getValue()}
      </Typography>
    ),
  }),

  columnHelper.accessor('subsequentDeposits', {
    header: 'Subsequent Deposits',
    cell: (props) => (
      <Typography ta="center" variant="body1">
        {props.getValue()}
      </Typography>
    ),
  }),

  columnHelper.accessor('note', {
    header: 'Note',
    cell: (props) => (
      <div className="flex items-center justify-center">
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
  onUploadSpendNote,
  onActiveTabChange,
  onDefaultDestinationChainChange,
  ondefaultFungibleCurrencyChange,
}) => {
  const { isSyncingNote } = useNoteAccount();

  const columns = useMemo<Array<ColumnDef<SpendNoteDataType, any>>>(() => {
    return [
      ...staticColumns,

      columnHelper.accessor('assetsUrl', {
        header: '',
        cell: (props) => {
          const data = props.row.original;

          return (
            <ActionDropdownButton
              onActiveTabChange={onActiveTabChange}
              onDefaultDestinationChainChange={onDefaultDestinationChainChange}
              ondefaultFungibleCurrencyChange={ondefaultFungibleCurrencyChange}
              data={data}
            />
          );
        },
      }),
    ];
  }, [
    onActiveTabChange,
    onDefaultDestinationChainChange,
    ondefaultFungibleCurrencyChange,
  ]);

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
        description="Notes are stored locally and encrypted on-chain. Can't find spend note?"
        buttonText="Upload spend Notes"
        onClick={onUploadSpendNote}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180">
      <Table
        thClassName="border-t-0 bg-mono-0 dark:bg-mono-160 text-center"
        tdClassName="min-w-max"
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
        title="notes"
      />
    </div>
  );
};

const ActionDropdownButton: FC<
  { data: SpendNoteDataType } & Pick<
    SpendNotesTableContainerProps,
    | 'onActiveTabChange'
    | 'onDefaultDestinationChainChange'
    | 'ondefaultFungibleCurrencyChange'
  >
> = ({
  data,
  onActiveTabChange,
  onDefaultDestinationChainChange,
  ondefaultFungibleCurrencyChange,
}) => {
  const onQuickTransfer = useCallback(() => {
    const { rawChain, rawFungibleCurrency } = data;

    onActiveTabChange?.('Transfer');

    onDefaultDestinationChainChange?.(rawChain);

    if (rawFungibleCurrency) {
      ondefaultFungibleCurrencyChange?.(rawFungibleCurrency);
    }
  }, [
    data,
    onActiveTabChange,
    onDefaultDestinationChainChange,
    ondefaultFungibleCurrencyChange,
  ]);

  const onQuickWithdraw = useCallback(() => {
    const { rawChain, rawFungibleCurrency } = data;

    onActiveTabChange?.('Withdraw');

    onDefaultDestinationChainChange?.(rawChain);

    if (rawFungibleCurrency) {
      ondefaultFungibleCurrencyChange?.(rawFungibleCurrency);
    }
  }, [
    data,
    onActiveTabChange,
    onDefaultDestinationChainChange,
    ondefaultFungibleCurrencyChange,
  ]);

  return (
    <div className="flex items-center space-x-1">
      <ActionWithTooltip content="Transfer">
        <Button
          variant="utility"
          size="sm"
          className="p-2"
          onClick={onQuickTransfer}
        >
          <SendPlanLineIcon className="!fill-current" />
        </Button>
      </ActionWithTooltip>

      <ActionWithTooltip content="Withdraw">
        <Button
          variant="utility"
          size="sm"
          className="p-2"
          onClick={onQuickWithdraw}
        >
          <WalletLineIcon className="!fill-current" />
        </Button>
      </ActionWithTooltip>
    </div>
  );
};

/***********************
 * Internal components *
 ***********************/

const ActionWithTooltip: FC<PropsWithChildren<{ content: string }>> = ({
  content,
  children,
}) => {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipBody>
        <Typography variant="body3">{content}</Typography>
      </TooltipBody>
    </Tooltip>
  );
};
