import {
  ProposalType,
  useProposalDetailsLazyQuery,
  useProposalsLazyQuery,
  useProposalsOverviewLazyQuery,
  useProposalVotesLazyQuery,
} from '@webb-dapp/page-statistics/generated/graphql';
import { mapProposalListItem } from '@webb-dapp/page-statistics/provider/hooks/mappers';
import { Loadable, Page, PageInfoQuery, ProposalStatus } from '@webb-dapp/page-statistics/provider/hooks/types';
import { useCurrentMetaData } from '@webb-dapp/page-statistics/provider/hooks/useCurrentMetaData';
import { useEffect, useState } from 'react';

import { Threshold as QueryThreshold } from './types';

type Thresholds = {
  proposal: number;
  proposers: number;
};

type ProposalTypeStats = {
  accepted: number;
  rejected: number;
  open: number;
  signed: number;
};
type ListOverView<T = string> = {
  firstElements: T[];
  count: number;
};
export type ProposalListItem = {
  id: string;
  status: ProposalStatus;
  type: ProposalType;
  txHash: string;
  proposers: ListOverView;
  chain: string;
};
type ProposalsPage = Loadable<Page<ProposalListItem>>;
type ProposalsOverview = {
  thresholds: Thresholds;
  stats: ProposalTypeStats;
  openProposals: ProposalListItem[];
};
type ProposalTimeLine = {
  status: ProposalStatus;
  at: Date;
  blockNumber: number;
  hash: string;
};
type ProposalDetails = {
  id: string;
  height: string;
  tsHash: string;
  chain: string;
  forPercentage: number;
  againstPercentage: number;
  abstainPercentage: number;
  forCount: number;
  againstCount: number;
  abstainCount: number;
  timeline: ProposalTimeLine[];
  data: {
    type: ProposalType;
    data: string;
  };
};

export function useProposalsOverview(): Loadable<ProposalsOverview> {
  const [proposalsOverview, setProposalsOverview] = useState<Loadable<ProposalsOverview>>({
    isLoading: true,
    val: null,
    isFailed: false,
  });
  const [call, query] = useProposalsOverviewLazyQuery();
  const metaData = useCurrentMetaData();

  useEffect(() => {
    if (metaData.val) {
      const currentSession = metaData.val.activeSession;
      call({
        variables: {
          endRange: {
            lessThanOrEqualTo: 300,
          },
          startRange: {
            greaterThanOrEqualTo: 0,
          },
          sessionId: currentSession,
        },
      }).catch((e) => {
        setProposalsOverview({
          isLoading: false,
          isFailed: true,
          val: null,
          error: e.message,
        });
      });
    }
  }, [metaData, call]);
  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<ProposalsOverview> => {
        if (res.data && res.data.session && res.data.openProposals) {
          const session = res.data.session!;
          const thresholds: Thresholds = {
            proposal: (session.proposerThreshold as QueryThreshold).current,
            proposers: session.sessionProposers.totalCount,
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

export function useProposals(reqQuery: PageInfoQuery): ProposalsPage {
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

export function useProposal(
  targetSessionId: string,
  proposalId: string,
  votesReqQuery: PageInfoQuery
): Loadable<ProposalDetails> {
  const [proposalDetails, setProposalDetails] = useState<Loadable<ProposalDetails>>({
    isLoading: false,
    val: null,
    isFailed: false,
  });
  const [call, query] = useProposalDetailsLazyQuery();
  const { offset, perPage } = votesReqQuery;
  useEffect(() => {
    call({
      variables: {
        id: proposalId,
        VotesOffset: offset,
        VotesPerPage: perPage,
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
    const subscription = query.observable
      .map((res): Loadable<ProposalDetails> => {
        if (res.data && res.data.proposalItem && res.data.session) {
          const proposal = res.data.proposalItem;
          const forCount = proposal.votesFor.totalCount;
          const allVotes = proposal.totalVotes.totalCount;
          const expectedVotesCount = res.data.session.sessionProposers.totalCount;
          const abstainCount = expectedVotesCount - allVotes;
          const againstCount = allVotes - forCount;
          return {
            isLoading: false,
            isFailed: false,
            val: {
              id: proposal.id,
              data: {
                data: proposal.data,
                type: proposal.type,
              },
              abstainCount,
              forCount,
              againstCount,
              abstainPercentage: (abstainCount / expectedVotesCount) * 100,
              forPercentage: (forCount / expectedVotesCount) * 100,
              againstPercentage: (againstCount / expectedVotesCount) * 100,
              chain: '',
              height: proposal.block?.timestamp!,
              timeline: [],
              tsHash: '',
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

  return proposalDetails;
}

type VoteListItem = {
  id: string;
  voterId: string;
  for: boolean;
  timestamp: Date;
};
type VotesPage = Loadable<Page<VoteListItem>>;

export function useVotes(
  votesReqQuery: PageInfoQuery<{
    proposalId: string;
    isFor?: boolean;
  }>
): VotesPage {
  const [votes, setVotes] = useState<VotesPage>({
    isLoading: true,
    isFailed: false,
    val: null,
  });
  const [call, query] = useProposalVotesLazyQuery();
  const {
    filter: { isFor, proposalId },
    offset,
    perPage,
  } = votesReqQuery;
  useEffect(() => {
    call({
      variables: {
        proposalId,
        offset,
        perPage,
        for: isFor ? { equalTo: isFor } : undefined,
      },
    }).catch((e) => {
      setVotes({
        isLoading: false,
        isFailed: true,
        val: null,
        error: e.message,
      });
    });
  }, [perPage, offset, isFor, call, proposalId]);

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
                for: vote.for,
                id: vote.id,
                voterId: vote.voterId,
                timestamp: new Date(vote.block?.timestamp!),
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
