import {
  ProposalType,
  useProposalDetailsLazyQuery,
  useProposalsLazyQuery,
  useProposalsOverviewLazyQuery,
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
  votes: Page<{
    id: string;
    for: boolean;
    hash: string;
  }>;
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

export function useProposal(proposalId: string, votesReqQuery: PageInfoQuery): Loadable<ProposalDetails> {
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
      },
    }).catch((e) => {
      setProposalDetails({
        isLoading: false,
        isFailed: true,
        val: null,
        error: e.message,
      });
    });
  }, [proposalId, offset, perPage, call]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<ProposalDetails> => {
        if (res.data && res.data.proposalItem) {
          const proposal = res.data.proposalItem;
          const forVotes = proposal.votesFor.totalCount;
          const allVotes = proposal.totalVotes.totalCount;
          const;
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
