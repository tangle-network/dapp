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
import { FC } from 'react';
import { EmptyTable } from '../../components/tables';
import {
  ShieldedAssetDataType,
  ShieldedAssetsTableContainerProps,
} from './types';

const columnHelper = createColumnHelper<ShieldedAssetDataType>();

const columns: ColumnDef<ShieldedAssetDataType, any>[] = [
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

  columnHelper.accessor('governedTokenSymbol', {
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

      const firstTwoTokens = composition.slice(0, 2);
      const numOfHiddenTokens = composition.length - 2;

      return (
        <div className="flex items-center space-x-1">
          {firstTwoTokens.length === 1 ? (
            <TokenIcon name={firstTwoTokens[0]} />
          ) : (
            <TokenPairIcons
              token1Symbol={firstTwoTokens[0]}
              token2Symbol={firstTwoTokens[1]}
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

  columnHelper.accessor('assetsUrl', {
    header: 'Action',
    cell: () => {
      return (
        <div className="flex items-center space-x-1">
          <Button variant="utility" size="sm" className="p-2">
            <AddBoxLineIcon className="!fill-current" />
          </Button>

          <Button variant="utility" size="sm" className="p-2">
            <SendPlanLineIcon className="!fill-current" />
          </Button>

          <Button variant="utility" size="sm" className="p-2">
            <WalletLineIcon className="!fill-current" />
          </Button>
        </div>
      );
    },
  }),
];

export const ShieldedAssetsTableContainer: FC<
  ShieldedAssetsTableContainerProps
> = ({ data = [], onUploadSpendNote }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  if (!data.length) {
    return (
      <EmptyTable
        title="No assets found"
        description="Don't see your assets?"
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
      />
    </div>
  );
};
