import { SessionAuthFragment, ValidatorMetaFragment } from '@webb-dapp/page-statistics/generated/graphql';

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
export function mapAuthorities(data: SessionAuthFragment): Authority[] {
  return data.sessionValidators.edges.map(
    (item): Authority => ({
      id: item.node?.validator?.id!,
      sessionId: item.node?.sessionId!,
      reputation: item.node?.reputation!,
      isBest: item.node?.isBest!,
      isNext: item.node?.isNext!,
      isNextBest: item.node?.isNextBest!,
      bestOrder: item.node?.bestOrder!,
      nextBestOrder: item.node?.nextBestOrder!,
      authorityId: item.node?.validator?.authorityId!,
    })
  );
}
