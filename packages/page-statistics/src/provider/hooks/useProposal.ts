import { ProposalType } from '@webb-dapp/page-statistics/generated/graphql';
import { Loadable, Page, ProposalStatus } from '@webb-dapp/page-statistics/provider/hooks/types';

type Thresholds = {
  proposal: string;
  proposers: string;
};

type ProposalTypeStats = {
  accepted: number;
  rejected: number;
  open: number;
  signed: number;
};
type ProposalListItem = {
  id: string;
  status: ProposalStatus;
  type: ProposalType;
  txHash: string;
  proposers: string[];
  chain: string;
};

type ProposalsOverview = {
  thresholds: Loadable<Thresholds>;
  stats: Loadable<ProposalTypeStats>;
  openProposals: Loadable<Page<ProposalListItem>>;
  allProposals: Loadable<Page<ProposalListItem>>;
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
  for: [number, string[]];
  against: [number, string[]];
  abstain: [number, string[]];
  timeline: ProposalTimeLine[];
  data: {
    type: ProposalType;
    data: string;
  };
};

export function useProposals(): ProposalsOverview {
  // TODO: implement the proposals hooks
  throw new Error('Not implemented');
}

export function useProposal(): Loadable<ProposalDetails> {
  throw new Error('Not implemented');
}
