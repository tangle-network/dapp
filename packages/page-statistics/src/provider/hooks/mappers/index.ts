import {
  ProposalListViewFragment,
  ProposalStatus,
  ProposalType,
  SessionAuthValidatorFragment,
  SessionAuthValidatorNodeFragment,
} from '@webb-dapp/page-statistics/generated/graphql';
import { ProposalListItem } from '@webb-dapp/page-statistics/provider/hooks';

export type Authority = {
  id: string;
  sessionId: string;
  reputation: string;
  isBest: boolean;
  isNext: boolean;
  isNextBest: boolean;
  bestOrder: number;
  nextBestOrder: number;
  authorityId: string;
};

export function mapSessionAuthValidatorNode(node: SessionAuthValidatorNodeFragment): Authority {
  return {
    id: node!.validator?.id!,
    sessionId: node.sessionId,
    reputation: node.reputation,
    isBest: node.isBest,
    isNext: node.isNext,
    isNextBest: node.isNextBest,
    bestOrder: node.bestOrder,
    nextBestOrder: node.nextBestOrder,
    authorityId: node.validator?.authorityId!,
  };
}

export function mapAuthorities(data: SessionAuthValidatorFragment): Authority[] {
  return data.edges.map((item) => mapSessionAuthValidatorNode(item.node!));
}

export function mapProposalListItem(data: ProposalListViewFragment): ProposalListItem {
  return {
    id: data.id,
    chain: '',
    proposers: {
      count: data.proposalVotesByProposalId.totalCount,
      firstElements: data.proposalVotesByProposalId.nodes.map((node) => node!.id),
    },
    status: data.status as ProposalStatus,
    txHash: '',
    type: data.type as ProposalType,
  };
}
