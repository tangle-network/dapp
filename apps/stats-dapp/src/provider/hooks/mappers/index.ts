import {
  SessionAuthValidatorFragment,
  SessionAuthValidatorNodeFragment,
} from '../../../generated/graphql';

export type Authority = {
  id: string;
  location: string | null;
  sessionId: string;
  reputation: number;
  isBest: boolean;
  isNext: boolean;
  isNextBest: boolean;
  bestOrder: number;
  nextBestOrder: number;
  authorityId: string;
  uptime: number;
};

export function mapSessionAuthValidatorNode(
  node: SessionAuthValidatorNodeFragment,
): Authority {
  return {
    id: node?.validator?.id ?? '',
    sessionId: node.sessionId,
    reputation: node.reputation,
    uptime: node.uptime,
    isBest: node.isBest,
    isNext: node.isNext,
    isNextBest: node.isNextBest,
    bestOrder: node.bestOrder,
    nextBestOrder: node.nextBestOrder,
    authorityId: node?.validator?.authorityId ?? '',
    location: node?.validator?.account?.countryCodeId ?? '',
  };
}

export function mapAuthorities(
  data: SessionAuthValidatorFragment,
): Authority[] {
  return data?.edges.map((item: any) => mapSessionAuthValidatorNode(item.node));
}
