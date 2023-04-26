import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { useStatsContext } from '../provider/stats-provider';
import {
  Button,
  Card,
  LabelWithValue,
  Stats,
  TitleWithInfo,
} from '@webb-tools/webb-ui-components/components';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { ExternalLinkLine, TokenIcon } from '@webb-tools/icons';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import { ArcElement, Chart as ChartJS, Legend } from 'chart.js';
import { BigNumber } from 'ethers';
import React, { useMemo, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ProposalsTable, TimeRange } from '../containers';
import {
  ProposalListItem,
  ProposalStatus,
  useProposalsOverview,
} from '../provider/hooks';
import { mapChainIdToLogo } from '../utils';
import { StackedAreaChartContainer } from '../containers/StackedAreaChartContainer';

const columnHelper = createColumnHelper<ProposalListItem>();

const columns: ColumnDef<ProposalListItem, any>[] = [
  columnHelper.accessor('height', {
    header: 'Height',
    cell: (props) =>
      BigNumber.from(props.getValue<string>())
        .div(1000)
        .toBigInt()
        .toLocaleString(),
  }),

  columnHelper.accessor('type', {
    header: 'Type',
  }),

  columnHelper.accessor('txHash', {
    header: 'Tx Hash',
    cell: (props) => (
      <div className="flex items-center space-x-1">
        <LabelWithValue
          labelVariant="body3"
          label="tx hash:"
          isHiddenLabel
          value={shortenHex(props.getValue<string>(), 3)}
          valueTooltip={props.getValue<string>()}
        />
        <a href="#">
          <ExternalLinkLine />
        </a>
      </div>
    ),
  }),

  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: (props) => {
      const name = mapChainIdToLogo(Number(props.getValue()));
      return <TokenIcon name={name} size="lg" />;
    },
  }),

  columnHelper.accessor('id', {
    header: '',
    cell: (props) => (
      <Button variant="link" size="sm">
        <Link to={`drawer/${props.getValue<string>()}`}>Details</Link>
      </Button>
    ),
  }),
];

ChartJS.register(ArcElement, Legend);

const Proposals = () => {
  const {
    blockTime,
    metaData: { activeSession, lastProcessBlock },
  } = useStatsContext();

  const [timeRange, setTimeRange] = useState<TimeRange>('Day');

  const range = useMemo(() => {
    let rangeTimeSec = undefined;
    switch (timeRange) {
      case 'Day':
        rangeTimeSec = 24 * 60 * 60;
        break;
      case 'Week':
        rangeTimeSec = 24 * 60 * 60 * 7;
        break;
      case 'Year':
        rangeTimeSec = 24 * 60 * 60 * 365;
        break;
      case 'All Time':
        rangeTimeSec = undefined;
    }
    if (!rangeTimeSec) {
      return { start: 0, end: Number(lastProcessBlock) };
    }
    const end = Number(lastProcessBlock);
    const start = Math.floor(
      Math.max(Number(lastProcessBlock) - rangeTimeSec / blockTime, 0)
    );

    return {
      end,
      start,
    };
  }, [timeRange, lastProcessBlock, blockTime]);

  const overview = useProposalsOverview(activeSession, range);

  const data = useMemo(() => {
    if (overview.val) {
      return overview.val.openProposals.length > 5
        ? overview.val.openProposals.slice(0, 5)
        : overview.val.openProposals;
    }
    return [] as ProposalListItem[];
  }, [overview]);
  
  const statsMap: Record<ProposalStatus, number> = useMemo(() => {
    if (overview.val) {
      const { accepted, open, rejected, signed } = overview.val.stats;
      return {
        [ProposalStatus.Signed]: signed,
        [ProposalStatus.Rejected]: rejected,
        [ProposalStatus.Open]: open,
        [ProposalStatus.Accepted]: accepted,
        [ProposalStatus.FailedToExecute]: 0,
        [ProposalStatus.Executed]: 0,
        [ProposalStatus.Removed]: 0,
      };
    }
    return {
      [ProposalStatus.Signed]: 0,
      [ProposalStatus.Rejected]: 0,
      [ProposalStatus.Open]: 0,
      [ProposalStatus.Accepted]: 0,
      [ProposalStatus.FailedToExecute]: 0,
      [ProposalStatus.Executed]: 0,
      [ProposalStatus.Removed]: 0,
    };
  }, [overview]);

  const statsItems = useMemo<
    React.ComponentProps<typeof Stats>['items']
  >(() => {
    const proposalsThreshold = overview.val
      ? overview.val.thresholds.proposal
      : 'NaN';
    const proposers = overview.val ? overview.val.thresholds.proposers : 'NaN';
    return [
      {
        titleProps: {
          title: 'Proposal Threshold',
          info: 'Proposal Threshold',
        },
        value: proposalsThreshold,
      },
      {
        titleProps: {
          title: 'Proposers',
          info: 'Proposers',
        },
        value: proposers,
      },
    ];
  }, [overview]);

  const table = useReactTable<ProposalListItem>({
    columns: columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  const noOpenProposals = useMemo(() => data.length === 0, [data]);

  return (
    <div className="flex flex-col space-y-4">
      {/** Proposals Status */}
      <Card>
        <TitleWithInfo
          title="Proposals Status"
          variant="h5"
          info="Proposals Status"
        />

        <Stats items={statsItems} />
      </Card>

      <StackedAreaChartContainer />

      {/** All Proposals */}
      <ProposalsTable />

      <Outlet />
    </div>
  );
};

export default Proposals;
