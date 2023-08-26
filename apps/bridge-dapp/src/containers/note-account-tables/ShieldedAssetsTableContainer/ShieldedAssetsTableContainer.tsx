import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain } from '@webb-tools/dapp-config';
import {
  ChainIcon,
  ExternalLinkLine,
  SendPlanLineIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import { useNoteAccount } from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import {
  formatTokenAmount,
  fuzzyFilter,
  IconsGroup,
  IconWithTooltip,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';

import { EmptyTable, LoadingTable } from '../../../components/tables';
import { downloadNotes } from '../../../utils';
import { ActionWithTooltip } from '../ActionWithTooltip';
import { MoreOptionsDropdown } from '../MoreOptionsDropdown';
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
        {formatTokenAmount(props.getValue())}
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
  onActiveTabChange,
  onDefaultDestinationChainChange,
  onDefaultFungibleCurrencyChange,
  onDeleteNotesChange,
  onUploadSpendNote,
  globalSearchText,
}) => {
  const { isSyncingNote } = useNoteAccount();

  const { switchChain, activeWallet } = useWebContext();

  const promptChainSwitch = useCallback(
    async (chain: Chain) => {
      const isSupported =
        activeWallet &&
        activeWallet.supportedChainIds.includes(
          calculateTypedChainId(chain.chainType, chain.id)
        );

      if (isSupported) {
        await switchChain(chain, activeWallet);
      }
    },
    [activeWallet, switchChain]
  );

  const onTransfer = useCallback(
    async (shieldedAsset: ShieldedAssetDataType) => {
      onActiveTabChange?.('Transfer');

      const { rawChain, rawFungibleCurrency } = shieldedAsset;

      await promptChainSwitch(rawChain);

      onDefaultDestinationChainChange?.(rawChain);

      if (rawFungibleCurrency) {
        onDefaultFungibleCurrencyChange?.(rawFungibleCurrency);
      }
    },
    [
      onActiveTabChange,
      onDefaultDestinationChainChange,
      onDefaultFungibleCurrencyChange,
      promptChainSwitch,
    ]
  );

  const onWithdraw = useCallback(
    async (shieldedAsset: ShieldedAssetDataType) => {
      onActiveTabChange?.('Withdraw');

      const { rawChain, rawFungibleCurrency } = shieldedAsset;

      await promptChainSwitch(rawChain);

      onDefaultDestinationChainChange?.(rawChain);

      if (rawFungibleCurrency) {
        onDefaultFungibleCurrencyChange?.(rawFungibleCurrency);
      }
    },
    [
      onActiveTabChange,
      onDefaultDestinationChainChange,
      onDefaultFungibleCurrencyChange,
      promptChainSwitch,
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
              <ActionWithTooltip
                tooltipContent="Transfer"
                onClick={() => onTransfer(shieldedAsset)}
              >
                <SendPlanLineIcon className="!fill-current" />
              </ActionWithTooltip>

              <ActionWithTooltip
                tooltipContent="Withdraw"
                onClick={() => onWithdraw(shieldedAsset)}
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
    [onDeleteNotesChange, onTransfer, onWithdraw]
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
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
        title="assets"
      />
    </div>
  );
};
