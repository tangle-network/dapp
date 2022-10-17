import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { ChainConfig } from '@webb-dapp/api-providers';
import { chainsConfig } from '@webb-dapp/apps/configs';
import { ProposalStatus, ProposalType } from '@webb-dapp/page-statistics/generated/graphql';
import { ProposalListItem, ProposalsQuery, useProposals } from '@webb-dapp/page-statistics/provider/hooks';
import { getChipColorByProposalType } from '@webb-dapp/page-statistics/utils';
import {
  Avatar,
  AvatarGroup,
  Button,
  CardTable,
  Chip,
  Collapsible,
  CollapsibleButton,
  CollapsibleContent,
  Filter,
  LabelWithValue,
  Table,
} from '@webb-dapp/webb-ui-components/components';
import { CheckBoxMenu } from '@webb-dapp/webb-ui-components/components/CheckBoxMenu/CheckBoxMenu';
import { CheckBoxMenuGroup } from '@webb-dapp/webb-ui-components/components/CheckBoxMenu/CheckBoxMenuGroup';
import { ChipColors } from '@webb-dapp/webb-ui-components/components/Chip/types';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { ExternalLinkLine, TokenIcon } from '@webb-dapp/webb-ui-components/icons';
import { shortenHex } from '@webb-dapp/webb-ui-components/utils';
import * as flags from 'country-flag-icons/react/3x2';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<ProposalListItem>();

const columns: ColumnDef<ProposalListItem, any>[] = [
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (props) => (
      <Chip color={getChipColorByProposalType(props.getValue<ProposalStatus>())}>{props.getValue<string>()}</Chip>
    ),
  }),

  columnHelper.accessor('height', {
    header: 'Height',
    cell: (props) => props.getValue<string>(),
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

  columnHelper.accessor('proposers', {
    header: 'Proposers',
    cell: (props) => {
      const proposers = props.getValue<ProposalListItem['proposers']>();
      return (
        <AvatarGroup total={proposers.count}>
          {proposers.firstElements.map((item, idx) => (
            <Avatar sourceVariant={'address'} value={item} key={`${idx}-${item}`} />
          ))}
        </AvatarGroup>
      );
    },
  }),

  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: () => <TokenIcon name='eth' size='lg' />,
  }),

  columnHelper.accessor('id', {
    header: '',
    cell: (props) => (
      <Button variant='link' size='sm'>
        <Link to={`drawer/${props.getValue<string>()}`}>Details</Link>
      </Button>
    ),
  }),
];
const PROPOSAL_TYPES: ProposalType[] = [
  ProposalType.AnchorCreateProposal,
  ProposalType.AnchorUpdateProposal,
  ProposalType.EvmProposal,
  ProposalType.FeeRecipientUpdateProposal,
  ProposalType.MaxDepositLimitUpdateProposal,
  ProposalType.MinWithdrawalLimitUpdateProposal,
  ProposalType.ProposerSetUpdateProposal,
  ProposalType.RefreshVote,
  ProposalType.RescueTokensProposal,
  ProposalType.ResourceIdUpdateProposal,
  ProposalType.SetTreasuryHandlerProposal,
  ProposalType.SetVerifierProposal,
  ProposalType.TokenAddProposal,
  ProposalType.TokenRemoveProposal,
  ProposalType.WrappingFeeUpdateProposal,
];
const PROPOSAL_STATUS: ProposalStatus[] = [
  ProposalStatus.Accepted,
  ProposalStatus.Executed,
  ProposalStatus.FailedToExecute,
  ProposalStatus.Open,
  ProposalStatus.Rejected,
  ProposalStatus.Signed,
];
function mapProposalStatusToChipColor(status: ProposalStatus): ChipColors {
  switch (status) {
    case ProposalStatus.Accepted:
      return 'blue';
    case ProposalStatus.Executed:
      return 'purple';
    case ProposalStatus.FailedToExecute:
      return 'purple';
    case ProposalStatus.Open:
      return 'green';
    case ProposalStatus.Rejected:
      return 'red';
    case ProposalStatus.Removed:
      return 'red';
    case ProposalStatus.Signed:
      return 'blue';
  }
}
export const ProposalsTable = () => {
  // Pagination state
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const chains = useMemo<Array<[string, ChainConfig]>>(
    () => Object.keys(chainsConfig).map((key: any) => [String(key), chainsConfig[key]]),
    []
  );
  const chainIds = useMemo(() => chains.map(([key]) => key), [chains]);

  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedProposalsStatuses, setSelectedProposalStatuses] = useState<'all' | ProposalStatus[]>('all');
  const [selectedProposalTypes, setSelectedProposalTypes] = useState<'all' | ProposalType[]>('all');
  const [selectedChains, setSelectedChains] = useState<'all' | [string, ChainConfig][]>('all');

  const pageQuery: ProposalsQuery = useMemo(
    () => ({
      offset: pagination.pageIndex * pageSize,
      perPage: pagination.pageSize,
      filter: {
        status: selectedProposalsStatuses === 'all' ? undefined : selectedProposalsStatuses,
        type: selectedProposalTypes === 'all' ? undefined : selectedProposalTypes,
        chains: selectedChains === 'all' ? undefined : selectedChains.map((i) => Number(i)),
      },
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
  const pageCount = useMemo(() => Math.ceil(totalItems / pageSize), [pageSize, totalItems]);

  const proposalsStats = useProposals(pageQuery);
  const data = useMemo(() => {
    if (proposalsStats.val) {
      return proposalsStats.val.items;
    }
    return [] as ProposalListItem[];
  }, [proposalsStats]);
  useEffect(() => {
    if (proposalsStats.val) {
      setTotalItems(proposalsStats.val.pageInfo.count);
    }
  }, [proposalsStats]);

  const table = useReactTable<ProposalListItem>({
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

  const isAllProposalStatusesSelected = useMemo(
    () =>
      selectedProposalsStatuses === 'all' ||
      (Array.isArray(selectedProposalsStatuses) && selectedProposalsStatuses.length === PROPOSAL_STATUS.length),
    [selectedProposalsStatuses]
  );

  const isAllProposalTypesSelected = useMemo(
    () =>
      selectedProposalTypes === 'all' ||
      (Array.isArray(selectedProposalTypes) && selectedProposalTypes.length === PROPOSAL_TYPES.length),
    [selectedProposalTypes]
  );

  const isAllChainsSelected = useMemo(
    () => selectedChains === 'all' || (Array.isArray(selectedChains) && selectedChains.length === chains.length),
    [selectedChains, chains]
  );

  return (
    <CardTable
      titleProps={{
        title: 'All Proposals',
      }}
      leftTitle={
        <Filter
          searchPlaceholder={'Search  proposal type ,Chain , proposal status'}
          searchText={globalFilter}
          onSearchChange={(nextValue: string | number) => {
            setGlobalFilter(nextValue.toString());
          }}
          clearAllFilters={() => {
            table.setColumnFilters([]);
            table.setGlobalFilter('');
          }}
        >
          <Collapsible>
            <CollapsibleButton>Proposal Type</CollapsibleButton>
            <CollapsibleContent>
              <div
                style={{
                  maxWidth: '300px',
                  maxHeight: 300,
                  overflow: 'hidden',
                  overflowY: 'auto',
                }}
              >
                <CheckBoxMenu
                  checkboxProps={{
                    isChecked: isAllProposalTypesSelected,
                  }}
                  className={'text-xs'}
                  onChange={() => {
                    const next = isAllProposalTypesSelected ? [] : 'all';
                    setSelectedProposalTypes(next);
                  }}
                  label={'All'}
                />
                {PROPOSAL_TYPES.map((proposalType) => (
                  <CheckBoxMenu
                    className={'text-xs'}
                    checkboxProps={{
                      isChecked: isAllProposalTypesSelected ? true : selectedProposalTypes.indexOf(proposalType) > -1,
                    }}
                    onChange={() => {
                      const isSelected = selectedProposalTypes.indexOf(proposalType) > -1;
                      // IF all the countries are selected
                      if (isAllProposalTypesSelected) {
                        setSelectedProposalTypes(PROPOSAL_TYPES.filter((c) => c !== proposalType));
                      } else if (Array.isArray(selectedProposalTypes)) {
                        if (isSelected) {
                          setSelectedProposalTypes(selectedProposalTypes.filter((c) => c !== proposalType));
                        } else {
                          setSelectedProposalTypes([...selectedProposalTypes, proposalType]);
                        }
                      }
                    }}
                    label={proposalType}
                    key={`Filter_proposals${proposalType}`}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleButton>Proposal Status</CollapsibleButton>
            <CollapsibleContent>
              <div
                style={{
                  maxWidth: '300px',
                  maxHeight: 300,
                  overflow: 'hidden',
                  overflowY: 'auto',
                }}
              >
                <CheckBoxMenuGroup
                  value={selectedProposalsStatuses}
                  options={PROPOSAL_STATUS}
                  onChange={(v) => {
                    setSelectedProposalStatuses(v);
                  }}
                  labelGetter={(proposalStatus) => (
                    <Chip color={mapProposalStatusToChipColor(proposalStatus)}>{proposalStatus}</Chip>
                  )}
                  keyGetter={(proposalStatus) => `Filter_proposals${proposalStatus}`}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleButton>Chain</CollapsibleButton>
            <CollapsibleContent>
              <div
                style={{
                  maxWidth: '300px',
                  maxHeight: 300,
                  overflow: 'hidden',
                  overflowY: 'auto',
                }}
              >
                <CheckBoxMenuGroup
                  value={selectedChains}
                  options={chains}
                  onChange={(v) => {
                    setSelectedChains(v);
                  }}
                  icon={([_key, chainConfig]) => (
                    <div
                      style={{
                        maxWidth: 20,
                        maxHeight: 20,
                        overflow: 'hidden',
                        backgroundSize: '20px 20px',
                      }}
                    >
                      {<chainConfig.logo />}
                    </div>
                  )}
                  labelGetter={([_, chain]) => chain.name}
                  keyGetter={([chainId]) => `Filter_proposals${chainId}`}
                />

            </CollapsibleContent>
          </Collapsible>
        </Filter>
      }
    >
      <Table tableProps={table as RTTable<unknown>} isPaginated totalRecords={totalItems} />
    </CardTable>
  );
};
