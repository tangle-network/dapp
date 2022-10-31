import {
  ProposalType,
  ThresholdVariant,
  useEnsureProposalsLazyQuery,
  useProposalDetailsLazyQuery,
  useProposalsLazyQuery,
  useProposalsOverviewLazyQuery,
  useProposalVotesLazyQuery,
  VoteStatus,
} from '../../generated/graphql';
import { mapProposalListItem } from './mappers';
import { thresholdVariant } from './mappers/thresholds';
import { Loadable, Page, PageInfoQuery, ProposalStatus } from './types';
import { useEffect, useMemo, useState } from 'react';

import { Threshold as QueryThreshold } from './types';

/**
 * Threshold values
 * @param proposal - The proposer threshold value a session
 * @param proposers -The number of proposers of a session
 *
 * */
type Thresholds = {
  proposal: string;
  proposers: string;
};
/**
 * Proposal type Status counter map for proposal statuses
 * @params accepted - number of accepted proposals
 * @params rejected - number of rejected proposals
 * @params open - number of open proposals
 * @params signed - number of signed proposals
 * */
type ProposalTypeStats = {
  accepted: number;
  rejected: number;
  open: number;
  signed: number;
};
/** List over view
 *
 * A type for infinite number of list will show a defined number of items and will have the count for the full list
 * @param T - The underlying list item type
 * @param count - Total number of the list of `T`
 * */
export type DiscreteList<T = string> = {
  firstElements: T[];
  count: number;
};
/**
 * Proposal list item
 * @params id - proposal identifier
 * @params status - proposal status
 * @params type - proposal type
 * @params txHash -  Proposal submission transaction hash
 * @params proposers - proposers list view
 * @params chain - Proposal chain
 * */
export type ProposalListItem = {
  id: string;
  status: ProposalStatus;
  height?: string;
  type: ProposalType;
  txHash: string;
  proposers: DiscreteList;
  chain: string;
};

/**
 * Proposal page
 * */
type ProposalsPage = Loadable<Page<ProposalListItem>>;
/**
 * Proposals overview
 * @params totalProposals - total number of proposers and proposal the current threshold
 * @param status -  Proposal status counter `ProposalTypeStats`
 * @param openProposals -  list of recent open proposals
 **/
type ProposalsOverview = {
  thresholds: Thresholds;
  stats: ProposalTypeStats;
  openProposals: ProposalListItem[];
};
/**
 * Proposal timeline item
 *  @param status - Proposals status at that timeline item
 *  @param at - The data the timeline item took place
 *  @param blockNumber - the block number the timeline item took place
 *  @param hash - Transaction hash of the timeline item
 *
 * */
type ProposalTimeLine = {
  id: string;
  status: ProposalStatus;
  at: Date;
  blockNumber: number;
  hash: string;
};
/**
 * Vote listing item
 *
 * @param id - Vote identifier
 * @param voterId - The voter id (account 32)
 * @param for - Boolean value indicate if the vote is against or for the proposal, absent indicate abstain vote
 * @param timestamp - The date the vote took place
 * */
export type VoteListItem = {
  id: string;
  voterId: string;
  status: VoteStatus;
  timestamp: Date;
};
/**
 * Votes page type
 * */
type VotesPage = Loadable<Page<VoteListItem>>;

/**
 * Votes query
 * @param proposalId -  Proposal id to filter votes by proposal
 * @param isFor - Optional boolean value to filter votes by for or against if absent will return all votes
 * */
export type VotesQuery = PageInfoQuery<{
  proposalId: string;
  status?: VoteStatus;
}>;

/**
 * Proposal data
 * @params data - Proposal encoded proposal data
 * @params type - Proposal type
 * */
type ProposalData = {
  type: ProposalType;
  data: string;
};
/**
 * Proposal detail
 *
 * @params id - Proposal identifier
 * @params height - Proposal submission block number
 * @params tsHash - Proposal submission transaction hash
 * @params chain - Proposal chain
 * @params forPercentage - Percentage of votes for the proposal
 * @params againstPercentage - Percentage of votes against the proposal
 * @params abstainPercentage - Number of proposers that didn't submit a vote yet
 * @params forCount - Number of proposers that voted for the proposer
 * @params againstCount - Number of proposers that voted against the proposal
 * @params abstainCount - Number of proposals without any votes for the proposal
 * @params timeline - Progress of the proposal status
 * @param data - proposal data
 * */
export type ProposalDetails = {
  id: string;
  height: string;
  txHash: string;
  chain: string;
  forPercentage: number;
  againstPercentage: number;
  abstainPercentage: number;
  forCount: number;
  againstCount: number;
  abstainCount: number;
  allCount: number;
  timeline: ProposalTimeLine[];
  data: ProposalData;
  status: ProposalStatus;
};
type BlockRange = { start: number; end: number };
/**
 * Proposals overview
 * @return ProposalsOverview - Proposal overview data
 * */
export function useProposalsOverview(sessionId: string, range?: BlockRange): Loadable<ProposalsOverview> {
  const [proposalsOverview, setProposalsOverview] = useState<Loadable<ProposalsOverview>>({
    isLoading: true,
    val: null,
    isFailed: false,
  });
  const [call, query] = useProposalsOverviewLazyQuery();

  useEffect(() => {
    call({
      variables: {
        endRange: range
          ? {
              lessThanOrEqualTo: range.end,
            }
          : undefined,
        startRange: range
          ? {
              greaterThanOrEqualTo: range.start,
            }
          : undefined,
        sessionId: sessionId,
      },
    }).catch((e) => {
      setProposalsOverview({
        isLoading: false,
        isFailed: true,
        val: null,
        error: e.message,
      });
    });
  }, [range, sessionId, call]);
  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<ProposalsOverview> => {
        if (res.data && res.data.session && res.data.openProposals) {
          const session = res.data.session;
          const threshold = thresholdVariant(session.thresholds, ThresholdVariant.Proposer);

          const thresholds: Thresholds = {
            proposal: String(threshold?.current ?? '-'),
            proposers: String(session.sessionProposers.totalCount),
          };
          const openProposalsCount = res.data.open?.totalCount ?? 0;
          const rejectedProposalsCount = res.data.reject?.totalCount ?? 0;
          const signedProposalsCount = res.data.signed?.totalCount ?? 0;
          const acceptedProposalsCount = res.data.accepted?.totalCount ?? 0;
          const proposalStats: ProposalTypeStats = {
            open: openProposalsCount,
            rejected: rejectedProposalsCount,
            accepted: acceptedProposalsCount,
            signed: signedProposalsCount,
          };

          const openProposals = res.data.openProposals.nodes
            .filter((p) => p !== null)
            .map((p) => mapProposalListItem(p!));
          return {
            val: {
              openProposals,
              stats: proposalStats,
              thresholds,
            },
            isFailed: false,
            isLoading: false,
          };
        }
        return {
          isLoading: res.loading,
          isFailed: Boolean(res.error),
          error: res.error?.message ?? undefined,
          val: null,
        };
      })
      .subscribe(setProposalsOverview);
    return () => subscription.unsubscribe();
  }, [query]);
  return proposalsOverview;
}

type ProposalsFilters = {
  type?: ProposalType[];
  status?: ProposalStatus[];
  chains?: number[];
};
export type ProposalsQuery = PageInfoQuery<ProposalsFilters>;

/**
 * Listing query for proposals
 * */
export function useProposals(reqQuery: ProposalsQuery): ProposalsPage {
  const [proposalsPage, setProposalsPage] = useState<ProposalsPage>({
    isLoading: false,
    val: null,
    isFailed: false,
  });
  const [call, query] = useProposalsLazyQuery();
  useEffect(() => {
    call({
      variables: {
        offset: reqQuery.offset,
        perPage: reqQuery.perPage,
        filter:
          reqQuery.filter.type || reqQuery.filter.status || reqQuery.filter.chains
          ? {
              status: reqQuery.filter.status ? { in: reqQuery.filter.status } : undefined,
              type: reqQuery.filter.type ? { in: reqQuery.filter.type } : undefined,
              chainId: reqQuery.filter.chains ? { in: reqQuery.filter.chains } : undefined,
            }
          : undefined,
      },
    }).catch((e) => {
      setProposalsPage({
        isLoading: false,
        isFailed: true,
        val: null,
        error: e.message,
      });
    });
  }, [reqQuery, call]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): ProposalsPage => {
        if (res.data && res.data.proposalItems) {
          const data = res.data.proposalItems.nodes.filter((p) => p !== null).map((p) => mapProposalListItem(p!));
          return {
            isFailed: false,
            isLoading: false,
            val: {
              items: data,
              pageInfo: {
                count: res.data.proposalItems.totalCount,
                hasPrevious: res.data.proposalItems.pageInfo.hasPreviousPage,
                hasNext: res.data.proposalItems.pageInfo.hasNextPage,
              },
            },
          };
        }
        return {
          isLoading: res.loading,
          isFailed: Boolean(res.error),
          error: res.error?.message ?? undefined,
          val: null,
        };
      })
      .subscribe(setProposalsPage);
    return () => subscription.unsubscribe();
  }, [query]);

  return proposalsPage;
}

type NextAndPrevStatus = {
  nextProposalId: string | null;
  previousProposalId: string | null;
};
type ProposalDetailsPage = {
  proposal: Loadable<ProposalDetails>;
  votes: VotesPage;
  nextAndPrevStatus: Loadable<NextAndPrevStatus>;
};

/**
 * Load a proposal with paginated votes and status at a given session
 * @example
 * An example of using previous and next values
 * ```jsx
 *  const ProposalDetailsPage = ({id,targetSessionId}:{id:string ,targetSessionId:string}) => {
 *    const proposalDetailsPage = useProposal(targetSessionId , {
 *      offset: 0,
 *      perPage: 10,
 *      filter:{
 *        proposalId:id
 *      }
 *    });
 *    const nextAndPrevStatus = proposalDetailsPage.nextAndPrevStatus
 *    const hasNext = useMemo( () => nextAndPrevStatus.val?.nextProposalId !== null, [nextAndPrevStatus])
 *    const hasPrev = useMemo( () => nextAndPrevStatus.val?.previousProposalId !== null, [nextAndPrevStatus])
 *    return <div>
 *      <button  disabled={!hasPrev}>Next</button> <button disabled={!hasNext}>Prev</button>
 *    </div>
 *  }
 * ```
 *
 * */
export function useProposal(targetSessionId: string, votesReqQuery: VotesQuery): ProposalDetailsPage {
  const [proposalDetails, setProposalDetails] = useState<Loadable<ProposalDetails>>({
    isLoading: false,
    val: null,
    isFailed: false,
  });

  const [nextAndPrevStatus, setNextAndPrevStatus] = useState<Loadable<NextAndPrevStatus>>({
    isLoading: false,
    val: null,
    isFailed: false,
  });
  const [ensureProposals, ensureProposalsQuery] = useEnsureProposalsLazyQuery();

  const [call, query] = useProposalDetailsLazyQuery();
  const { offset, perPage } = votesReqQuery;
  const proposalId = votesReqQuery.filter.proposalId;
  const votes = useVotes(votesReqQuery);

  useEffect(() => {
    ensureProposals({
      variables: {
        ids: [Number(proposalId) - 1, Number(proposalId) + 1].map((i) => String(i)),
      },
    }).catch((e) => {
      setNextAndPrevStatus({
        val: null,
        error: e.message,
        isLoading: false,
        isFailed: true,
      });
    });
  }, [proposalId, ensureProposals]);

  useEffect(() => {
    call({
      variables: {
        id: proposalId,
        targetSessionId,
      },
    }).catch((e) => {
      setProposalDetails({
        isLoading: false,
        isFailed: true,
        val: null,
        error: e.message,
      });
    });
  }, [proposalId, offset, perPage, targetSessionId, call]);
  useEffect(() => {
    const subscription = ensureProposalsQuery.observable
      .map((res): Loadable<NextAndPrevStatus> => {
        if (res.data && res.data.proposalItems) {
          const proposals = res.data.proposalItems.nodes.filter((p) => p !== null);
          const nextProposalId = proposals.find((p) => Number(p!.id) === Number(proposalId) + 1)?.id ?? null;
          const previousProposalId = proposals.find((p) => Number(p!.id) === Number(proposalId) - 1)?.id ?? null;
          return {
            val: {
              nextProposalId,
              previousProposalId,
            },
            isFailed: false,
            isLoading: false,
          };
        }
        return {
          isLoading: res.loading,
          isFailed: Boolean(res.error),
          error: res.error?.message ?? undefined,
          val: null,
        };
      })
      .subscribe(setNextAndPrevStatus);
    return () => subscription.unsubscribe();
  }, [ensureProposalsQuery, setNextAndPrevStatus, proposalId]);
  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<ProposalDetails> => {
        if (res.data && res.data.proposalItem && res.data.session) {
          const proposal = res.data.proposalItem;
          const forCount = proposal.votesFor.totalCount;
          const allVotes = proposal.totalVotes.totalCount;
          const expectedVotesCount = res.data.session.sessionProposers.totalCount;
          const abstainCount = res.data.proposalItem.abstain.totalCount;
          const againstCount = res.data.proposalItem.against.totalCount;
          return {
            isLoading: false,
            isFailed: false,
            val: {
              id: proposal.id,
              data: {
                data: proposal.data,
                type: proposal.type,
              },
              status: proposal.status as any,
              abstainCount,
              forCount,
              againstCount,
              allCount: allVotes,
              abstainPercentage: (abstainCount / expectedVotesCount) * 100,
              forPercentage: (forCount / expectedVotesCount) * 100,
              againstPercentage: (againstCount / expectedVotesCount) * 100,
              chain: String(res.data.proposalItem.chainId),
              height: proposal.block.number,
              timeline: proposal.proposalTimelineStatuses.nodes.map((item) => {
                const statusItem = item;
                return {
                  at: new Date(statusItem.timestamp),
                  blockNumber: statusItem.blockNumber,
                  hash: '0x000',
                  status: statusItem.status,
                  id: statusItem.id,
                };
              }),
              txHash: '0x000',
            },
          };
        }
        return {
          isLoading: res.loading,
          isFailed: Boolean(res.error),
          error: res.error?.message ?? undefined,
          val: null,
        };
      })
      .subscribe(setProposalDetails);

    return () => subscription.unsubscribe();
  }, [query]);

  return useMemo(
    () => ({
      proposal: proposalDetails,
      votes,
      nextAndPrevStatus,
    }),
    [nextAndPrevStatus, proposalDetails, votes]
  );
}

export function useVotes(votesReqQuery: VotesQuery): VotesPage {
  const [votes, setVotes] = useState<VotesPage>({
    isLoading: true,
    isFailed: false,
    val: null,
  });
  const [call, query] = useProposalVotesLazyQuery();
  const {
    filter: { proposalId, status },
    offset,
    perPage,
  } = votesReqQuery;
  useEffect(() => {
    call({
      variables: {
        proposalId,
        offset,
        perPage,
        for: status ? { equalTo: status } : undefined,
      },
    }).catch((e) => {
      setVotes({
        isLoading: false,
        isFailed: true,
        val: null,
        error: e.message,
      });
    });
  }, [perPage, offset, status, call, proposalId]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): VotesPage => {
        if (res.data && res.data.proposalVotes) {
          const votes = res.data.proposalVotes;
          const data = votes.nodes
            .filter((p) => p !== null)
            .map((p): VoteListItem => {
              const vote = p!;
              return {
                status: vote.voteStatus,
                id: vote.id,
                voterId: vote.voterId,
                timestamp: new Date(vote.block?.timestamp),
              };
            });
          return {
            isFailed: false,
            isLoading: false,
            val: {
              items: data,
              pageInfo: {
                count: votes.totalCount,
                hasPrevious: votes.pageInfo.hasPreviousPage,
                hasNext: votes.pageInfo.hasNextPage,
              },
            },
          };
        }
        return {
          isLoading: res.loading,
          isFailed: Boolean(res.error),
          error: res.error?.message ?? undefined,
          val: null,
        };
      })
      .subscribe(setVotes);
    return () => subscription.unsubscribe();
  }, [query, setVotes]);

  return votes;
}
