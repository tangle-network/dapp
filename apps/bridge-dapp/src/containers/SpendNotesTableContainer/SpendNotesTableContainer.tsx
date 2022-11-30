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
  TokenIcon,
} from '@webb-tools/icons';
import { useNoteAccount } from '@webb-tools/react-hooks';
import {
  Button,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  fuzzyFilter,
  IconWithTooltip,
  KeyValueWithButton,
  MenuItem,
  shortenString,
  Table,
  TokenPairIcons,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';
import { EmptyTable, LoadingTable } from '../../components/tables';
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

  columnHelper.accessor('governedTokenSymbol', {
    header: 'Shielded Asset',
    cell: (props) => {
      const governedTokenSymbol = props.getValue<string>();
      const tokenUrl = props.row.original.assetsUrl;

      return (
        <div className="flex items-center space-x-1.5">
          <Typography className="uppercase" variant="body1" fw="bold">
            {governedTokenSymbol}
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
              +{numOfHiddenTokens} others
            </Typography>
          )}
        </div>
      );
    },
  }),

  columnHelper.accessor('balance', {
    header: 'Available Balance',
    cell: (props) => (
      <Typography variant="body1" fw="bold">
        {props.getValue()}
      </Typography>
    ),
  }),

  columnHelper.accessor('subsequentDeposits', {
    header: 'Subsequent deposits',
    cell: (props) => (
      <Typography ta="center" variant="body1">
        {props.getValue()}
      </Typography>
    ),
  }),

  columnHelper.accessor('note', {
    header: 'Note',
    cell: (props) => (
      <KeyValueWithButton
        shortenFn={(note: string) => shortenString(note, 4)}
        isHiddenLabel
        size="sm"
        keyValue={props.getValue()}
      />
    ),
  }),
];

export const SpendNotesTableContainer: FC<SpendNotesTableContainerProps> = ({
  data = [],
  onUploadSpendNote,
}) => {
  const { isSyncingNote } = useNoteAccount();

  const columns = useMemo<Array<ColumnDef<SpendNoteDataType, any>>>(() => {
    return [
      ...staticColumns,

      columnHelper.accessor('assetsUrl', {
        header: '',
        cell: (props) => {
          const note = props.row.original.note;

          return <ActionDropdownButton note={note} />;
        },
      }),
    ];
  }, []);

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
        description="Don't see your spend note?"
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
      />
    </div>
  );
};

const ActionDropdownButton: FC<{ note: string }> = ({ note }) => {
  const onQuickTransfer = useCallback(() => {
    console.log('Trying to quick transfer with note: ', note);
    console.warn('Quick transfer haven"t implemented yet ');
  }, [note]);

  const onQuickWithdraw = useCallback(() => {
    console.log('Trying to quick withdraw with note: ', note);
    console.warn('Quick withdraw haven"t implemented yet ');
  }, [note]);

  return (
    <Dropdown>
      <DropdownBasicButton>
        <Button as="span" variant="utility" size="sm" className="p-2">
          <ChevronDown className="!fill-current" />
        </Button>
      </DropdownBasicButton>

      <DropdownBody className="min-w-[200px]" size="sm">
        <MenuItem onClick={onQuickTransfer}>Quick Transfer</MenuItem>
        <MenuItem onClick={onQuickWithdraw}>Quick Withdraw</MenuItem>
      </DropdownBody>
    </Dropdown>
  );
};
