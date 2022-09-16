import {
  SessionAuthValidatorFragment,
  SessionAuthValidatorNodeFragment,
} from '@webb-dapp/page-statistics/generated/graphql';

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
