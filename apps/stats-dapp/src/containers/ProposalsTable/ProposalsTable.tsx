import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { ChainConfig, chainsConfig } from '@webb-tools/dapp-config';
import { getChipColorByProposalType, mapChainNameToLogo } from '../../utils';
import {
  Accordion,
  AccordionButton,
  AccordionContent,
  AccordionItem,
  CardTable,
  CheckBoxMenuGroup,
  Chip,
  Filter,
  Table,
  Divider,
  ProposalsBadgeGroup,
  Button,
} from '@webb-tools/webb-ui-components/components';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { ChainIcon, Spinner } from '@webb-tools/icons';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ProposalBatchStatus,
  ProposalType,
  ProposalBatchesOrderBy,
} from '../../generated/graphql';
import {
  ProposalBatch,
  BatchedProposalsQuery,
  useBatchedProposals,
} from '../../provider/hooks';
import {
  mapProposalStatusToChipColor,
  PROPOSAL_STATUS,
  PROPOSAL_TYPES,
} from './utils';

const columnHelper = createColumnHelper<ProposalBatch>();

const columns = [
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (props) => (
      <StatusChip status={props.getValue<ProposalBatchStatus>()} />
    ),
  }),

  columnHelper.accessor('height', {
    header: 'Height',
    cell: (props) => props.getValue<string>(),
  }),

  columnHelper.accessor('proposals', {
    header: 'Proposal(s)',
    cell: (props) => {
      const proposalTypes = props.getValue().map((proposal: any) => {
        return proposal.type;
      });
      return proposalTypes.length > 0 ? (
        <ProposalsBadgeGroup proposals={proposalTypes} />
      ) : (
        '--'
      );
    },
  }),

  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: (props) => {
      const logoName = mapChainNameToLogo(props.getValue());
      return <ChainIcon name={logoName} size="lg" />;
    },
  }),

  columnHelper.accessor('id', {
    header: '',
    cell: (props) => {
      const isDisabled =
        props.row.original.proposals.length === 0 ? true : false;

      return (
        <Button variant="link" size="sm" isDisabled={isDisabled}>
          <Link to={`drawer/${props.getValue<string>()}`}>Details</Link>
        </Button>
      );
    },
  }),
];

export const ProposalsTable = () => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const chains = useMemo<Array<[string, ChainConfig]>>(
    () =>
      Object.keys(chainsConfig).map((key: any) => [
        String(key),
        chainsConfig[key],
      ]),
    []
  );

  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedProposalsStatuses, setSelectedProposalStatuses] = useState<
    'all' | ProposalBatchStatus[]
  >('all');
  const [selectedProposalTypes, setSelectedProposalTypes] = useState<
    'all' | ProposalType[]
  >('all');
  const [selectedChains, setSelectedChains] = useState<
    'all' | [string, ChainConfig][]
  >('all');

  const pageQuery: BatchedProposalsQuery = useMemo(
    () => ({
      offset: pagination.pageIndex * pageSize,
      perPage: pagination.pageSize,
      orderBy: ProposalBatchesOrderBy.BlockNumberDesc,
      filter: null,
    }),
    [
      pageSize,
      pagination.pageIndex,
      pagination.pageSize,
      selectedProposalTypes,
      selectedProposalsStatuses,
      selectedChains,
    ]
  );

  const batchedProposals = useBatchedProposals(pageQuery);

  const totalItems = useMemo(() => {
    if (batchedProposals.val) {
      return batchedProposals.val.pageInfo.count;
    }
    return 0;
  }, [batchedProposals]);

  const pageCount = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [pageSize, totalItems]
  );

  const data = useMemo(() => {
    if (batchedProposals.val) {
      const proposalIds = batchedProposals.val.items.map((item) => item.id);
      localStorage.setItem('proposalIds', JSON.stringify(proposalIds));

      return batchedProposals.val.items;
    }

    return [] as ProposalBatch[];
  }, [batchedProposals]);

  const table = useReactTable<ProposalBatch>({
    columns,
    data: data,
    pageCount: pageCount,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  return (
    <CardTable
      titleProps={{
        title: 'All Proposals',
        info: 'List of all the proposal batches in the DKG.',
        variant: 'h5',
      }}
      leftTitle={
        <Filter
          searchPlaceholder={'Search proposals'}
          searchText={globalFilter}
          onSearchChange={(nextValue: string | number) => {
            setGlobalFilter(nextValue.toString());
          }}
          clearAllFilters={() => {
            table.setColumnFilters([]);
            table.setGlobalFilter('');
            setSelectedProposalTypes('all');
            setSelectedProposalStatuses('all');
            setSelectedChains('all');
          }}
        >
          <Accordion type={'single'} collapsible>
            <AccordionItem className={'p-0 py-0'} value={'proposal-type'}>
              <AccordionButton>Type</AccordionButton>
              <Divider className="bg-mono-40 dark:bg-mono-140" />
              <AccordionContent className="p-0">
                <div
                  className={
                    'max-w-[300px] max-h-[300px] overflow-x-hidden overflow-y-auto'
                  }
                >
                  <CheckBoxMenuGroup
                    value={selectedProposalTypes}
                    options={PROPOSAL_TYPES}
                    onChange={(v) => {
                      setSelectedProposalTypes(v);
                    }}
                    labelGetter={(proposalType) => (
                      <span className={'text-xs'}>{proposalType}</span>
                    )}
                    keyGetter={(proposalType) =>
                      `Filter_proposals${proposalType}`
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem className={'p-0 py-0'} value={'proposal-status'}>
              <AccordionButton>Status</AccordionButton>
              <Divider className="bg-mono-40 dark:bg-mono-140" />
              <AccordionContent className="p-0">
                <div
                  className={
                    'max-w-[300px] max-h-[300px] overflow-x-hidden overflow-y-auto'
                  }
                >
                  <CheckBoxMenuGroup
                    value={selectedProposalsStatuses}
                    options={PROPOSAL_STATUS}
                    onChange={(v) => {
                      setSelectedProposalStatuses(v);
                    }}
                    labelGetter={(proposalStatus) => (
                      <Chip
                        color={mapProposalStatusToChipColor(proposalStatus)}
                      >
                        {proposalStatus}
                      </Chip>
                    )}
                    keyGetter={(proposalStatus) =>
                      `Filter_proposals${proposalStatus}`
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem className={'p-0'} value={'chain'}>
              <AccordionButton>Chain</AccordionButton>
              <AccordionContent className="p-2">
                <div className="max-w-[300px] max-h-[300px] overflow-x-hidden overflow-y-auto">
                  <CheckBoxMenuGroup
                    value={selectedChains}
                    options={chains}
                    onChange={(v) => {
                      setSelectedChains(v);
                    }}
                    iconGetter={([_key, chainConfig]) => (
                      <div className="max-w-[20px] max-h-[20px] overflow-hidden ">
                        {/* {<chainConfig.logo />} */}
                      </div>
                    )}
                    labelGetter={([_, chain]) => chain.name}
                    keyGetter={([chainId]) => `Filter_proposals${chainId}`}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Filter>
      }
      className="h-fit-content"
    >
      {data.length > 0 ? (
        <Table
          tableProps={table}
          isPaginated
          totalRecords={totalItems}
          title="Proposals"
        />
      ) : (
        <div className="h-[740px] flex items-center flex-col justify-center">
          <Spinner size="xl" />
        </div>
      )}
    </CardTable>
  );
};

interface StatusChipProps {
  status: ProposalBatchStatus;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  return <Chip color={getChipColorByProposalType(status)}>{status}</Chip>;
};
