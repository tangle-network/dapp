import { useEffect, useState } from 'react';
import { Loadable, Page, PageInfoQuery } from './types';
import {
  useProposalBatchesLazyQuery,
  useProposalBatchQuery,
  ProposalBatchesOrderBy,
} from '../../generated/graphql';

export type ProposalTimeline = {
  status: string;
  timestamp: string;
};

export type Proposal = {
  data: string;
  type: string;
};

export type ProposalBatch = {
  id: string;
  status: string;
  height: number;
  proposals: Proposal[];
  chain: string;
  timeline: ProposalTimeline[];
};

export type BatchedProposalsQuery = PageInfoQuery & {
  orderBy?: ProposalBatchesOrderBy;
};

export type BatchedProposals = Loadable<Page<ProposalBatch>>;

export type BatchedProposalQuery = string;

export type BatchedProposal = Loadable<ProposalBatch>;

// FOR BATCHED PROPOSALS TABLE
export const useBatchedProposals = (
  batchedProposalsQuery: BatchedProposalsQuery
): BatchedProposals => {
  const { offset, perPage, orderBy } = batchedProposalsQuery;

  const [call, query] = useProposalBatchesLazyQuery();

  const [batchedProposals, setBatchedProposals] = useState<BatchedProposals>({
    isLoading: false,
    isFailed: false,
    val: {
      items: [],
      pageInfo: {
        count: 0,
        hasNext: false,
        hasPrevious: false,
      },
    },
  });

  useEffect(() => {
    call({
      variables: {
        offset,
        perPage,
        orderBy,
      },
      pollInterval: 10000,
      fetchPolicy: 'network-only',
    });
  }, [offset, perPage]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): BatchedProposals => {
        if (res.data) {
          const data = res.data.proposalBatches?.nodes
            .filter((batch) => batch !== null)
            .map((batch) => {
              return {
                id: batch?.id,
                status: batch?.status,
                height: Number(batch?.blockNumber),
                proposals: batch?.proposals?.map((proposal: any) => {
                  return {
                    type: proposal?.kind,
                    data: proposal?.data,
                  };
                }),
                chain: batch?.chain,
              };
            });

          return {
            isFailed: false,
            isLoading: false,
            val: {
              items: data as ProposalBatch[],
              pageInfo: {
                count: res.data.proposalBatches?.totalCount ?? 0,
                hasPrevious:
                  res.data.proposalBatches?.pageInfo.hasPreviousPage ?? false,
                hasNext:
                  res.data.proposalBatches?.pageInfo.hasNextPage ?? false,
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
      .subscribe(setBatchedProposals);

    return () => subscription.unsubscribe();
  }, [query]);

  return batchedProposals;
};

// FOR INDIVIDUAL BATCHED PROPOSAL DETAILS
export const useBatchedProposal = (
  batchedProposalQuery: BatchedProposalQuery
) => {
  const { data, error, loading } = useProposalBatchQuery({
    variables: {
      batchId: batchedProposalQuery,
    },
    pollInterval: 10000,
    fetchPolicy: 'network-only',
  });

  const [batchedProposal, setBatchedProposal] = useState<BatchedProposal>({
    isLoading: false,
    isFailed: false,
    val: null,
  });

  useEffect(() => {
    if (data) {
      const batch = data.proposalBatch;

      const proposalBatch = {
        id: batch?.id,
        status: batch?.status,
        height: Number(batch?.blockNumber),
        proposals: batch?.proposals?.map((proposal: any) => {
          return {
            type: proposal?.kind,
            data: proposal?.data,
          };
        }),
        chain: batch?.chain,
        timeline: batch?.timeline,
      };

      setBatchedProposal({
        isLoading: false,
        isFailed: false,
        val: proposalBatch as ProposalBatch,
      });

      return;
    }

    if (error) {
      setBatchedProposal({
        isLoading: false,
        isFailed: true,
        error: error.message,
        val: null,
      });
    }

    if (loading) {
      setBatchedProposal({
        isLoading: true,
        isFailed: false,
        val: null,
      });
    }
  }, [data, error, loading]);

  return batchedProposal;
};
