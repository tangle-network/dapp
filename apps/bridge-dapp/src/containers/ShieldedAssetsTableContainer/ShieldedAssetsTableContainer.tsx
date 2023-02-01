import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import {
  AddBoxLineIcon,
  ChainIcon,
  ExternalLinkLine,
  SendPlanLineIcon,
  TokenIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import { useNoteAccount } from '@webb-tools/react-hooks';
import {
  Button,
  fuzzyFilter,
  IconWithTooltip,
  Table,
  TokenPairIcons,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, PropsWithChildren, useCallback, useMemo } from 'react';
import { EmptyTable, LoadingTable } from '../../components/tables';
import {
  ShieldedAssetDataType,
  ShieldedAssetsTableContainerProps,
} from './types';

const columnHelper = createColumnHelper<ShieldedAssetDataType>();

const staticColumns: ColumnDef<ShieldedAssetDataType, any>[] = [
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
          <Typography className="uppercase" variant="body1" fw="bold">
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
        return null;
      }

      const [firstToken, secondToken] = composition.slice(0, 2);
      const numOfHiddenTokens = composition.length - 2;

      return (
        <div className="flex items-center space-x-1">
          {!secondToken ? (
            <IconWithTooltip
              icon={<TokenIcon name={firstToken} />}
              content={firstToken}
            />
          ) : (
            <TokenPairIcons
              token1Symbol={firstToken}
              token2Symbol={secondToken}
            />
          )}

          {numOfHiddenTokens > 0 && (
            <Typography className="inline-block" variant="body3">
              +3 others
            </Typography>
          )}
        </div>
      );
    },
  }),

  columnHelper.accessor('availableBalance', {
    header: 'Available Balance',
    cell: (props) => (
      <Typography variant="body1" fw="bold">
        {props.getValue()}
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
];

export const ShieldedAssetsTableContainer: FC<
  ShieldedAssetsTableContainerProps
> = ({
  data = [],
  onUploadSpendNote,
  onActiveTabChange,
  onDefaultDestinationChainChange,
  ondefaultFungibleCurrencyChange,
}) => {
  const { isSyncingNote } = useNoteAccount();

  const onTransfer = useCallback(
    (shieldedAsset: ShieldedAssetDataType) => {
      onActiveTabChange?.('Transfer');

      const { rawChain, rawFungibleCurrency } = shieldedAsset;

      onDefaultDestinationChainChange?.(rawChain);

      if (rawFungibleCurrency) {
        ondefaultFungibleCurrencyChange?.(rawFungibleCurrency);
      }
    },
    [
      onActiveTabChange,
      onDefaultDestinationChainChange,
      ondefaultFungibleCurrencyChange,
    ]
  );

  const onWithdraw = useCallback(
    (shieldedAsset: ShieldedAssetDataType) => {
      onActiveTabChange?.('Withdraw');

      const { rawChain, rawFungibleCurrency } = shieldedAsset;

      onDefaultDestinationChainChange?.(rawChain);

      if (rawFungibleCurrency) {
        ondefaultFungibleCurrencyChange?.(rawFungibleCurrency);
      }
    },
    [
      onActiveTabChange,
      onDefaultDestinationChainChange,
      ondefaultFungibleCurrencyChange,
    ]
  );

  const columns = useMemo<Array<ColumnDef<ShieldedAssetDataType, any>>>(
    () => [
      ...staticColumns,

      columnHelper.accessor('assetsUrl', {
        header: 'Action',
        cell: (props) => {
          const shieldedAsset = props.row.original;

          return (
            <div className="flex items-center space-x-1">
              <ActionWithTooltip content="Transfer">
                <Button
                  variant="utility"
                  size="sm"
                  className="p-2"
                  onClick={() => onTransfer(shieldedAsset)}
                >
                  <SendPlanLineIcon className="!fill-current" />
                </Button>
              </ActionWithTooltip>

              <ActionWithTooltip content="Withdraw">
                <Button
                  variant="utility"
                  size="sm"
                  className="p-2"
                  onClick={() => onWithdraw(shieldedAsset)}
                >
                  <WalletLineIcon className="!fill-current" />
                </Button>
              </ActionWithTooltip>
            </div>
          );
        },
      }),
    ],
    [onTransfer, onWithdraw]
  );

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
        thClassName="border-t-0 bg-mono-0 dark:bg-mono-160"
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
        title="Shielded Asset"
      />
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
