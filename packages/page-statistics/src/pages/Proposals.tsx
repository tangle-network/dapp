import { ColumnDef, createColumnHelper, getCoreRowModel, Table as RTTable, useReactTable } from '@tanstack/react-table';
import {
  Button,
  Card,
  CardTable,
  DropdownMenu,
  LabelWithValue,
  Table,
  TitleWithInfo,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { ExternalLinkLine, TokenIcon } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { shortenHex } from '@webb-dapp/webb-ui-components/utils';
import { BigNumber } from 'ethers';
import { useMemo, useState } from 'react';

import { useOpenProposalsSeedData } from '../hooks';
import { ProposalListItem } from '../provider/hooks';

const columnHelper = createColumnHelper<ProposalListItem>();

const columns: ColumnDef<ProposalListItem, any>[] = [
  columnHelper.accessor('height', {
    header: 'Height',
    cell: (props) => BigNumber.from(props.getValue<string>()).div(1000).toBigInt().toLocaleString(),
  }),

  columnHelper.accessor('type', {
    header: 'Type',
  }),

  columnHelper.accessor('txHash', {
    header: 'Tx Hash',
    cell: (props) => (
      <div className='flex items-center space-x-1'>
        <LabelWithValue
          labelVariant='body3'
          label='tx hash:'
          isHiddenLabel
          value={shortenHex(props.getValue<string>(), 3)}
          valueTooltip={props.getValue<string>()}
        />
        <a href='#'>
          <ExternalLinkLine />
        </a>
      </div>
    ),
  }),

  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: () => <TokenIcon name='eth' size='lg' />,
  }),

  columnHelper.accessor('id', {
    header: '',
    cell: () => (
      <Button varirant='link' size='sm' className='uppercase'>
        Details
      </Button>
    ),
  }),
];

const Proposals = () => {
  const proposalsThreshold = 49;
  const proposers = 24;

  const menuOptions = useMemo(() => ['Day', 'Week', 'Year', 'All Time'], []);
  const [selectIndex, setSelectIndex] = useState(0);

  const data = useOpenProposalsSeedData(5);

  const table = useReactTable<ProposalListItem>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  return (
    <div className='flex flex-col space-y-4'>
      {/** Proposals Status */}
      <Card>
        <TitleWithInfo title='Proposals Status' variant='h5' info='Proposals Status' />

        <div className='flex items-center pb-12 justify-evenly'>
          <div className='flex flex-col items-center space-y-2'>
            <TitleWithInfo title='Proposal Threshold' info='Proposal Threshold' />

            <Typography variant='h4' fw='bold'>
              {proposalsThreshold}
            </Typography>
          </div>

          <div className='flex flex-col items-center space-y-2'>
            <TitleWithInfo title='Proposers' info='Proposers' />

            <Typography variant='h4' fw='bold'>
              {proposers}
            </Typography>
          </div>
        </div>
      </Card>

      {/* * Proposal Types */}
      {/* <Card>
        <div className='flex items-center justify-between'>
          <TitleWithInfo title='Proposal Types' variant='h5' />

          <DropdownMenu
            size='sm'
            menuOptions={menuOptions.map((opt) => ({ value: opt }))}
            value={menuOptions[selectIndex]}
            onChange={(nextVal) => setSelectIndex(menuOptions.indexOf(nextVal))}
          />
        </div>
      </Card> */}

      {/** Open Proposals */}
      <CardTable titleProps={{ title: 'Open Proposals' }}>
        <Table tableProps={table as RTTable<unknown>} />
      </CardTable>
    </div>
  );
};

export default Proposals;
