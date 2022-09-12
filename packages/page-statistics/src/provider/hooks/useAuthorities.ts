import { Loadable, Page } from '@webb-dapp/page-statistics/provider/hooks/types';
import { PublicKey, PublicKeyListView } from '@webb-dapp/page-statistics/provider/hooks/useKeys';

type Thresholds = {
  keyGen: string;
  signature: string;
  proposer: string;
  publicKey: PublicKey;
};

type UpcomingThreshold = {
  stats: 'Pending' | 'Next' | 'Current';
  session: string;
  keyGen: string;
  signature: string;
  proposer: string;
  authoritySet: string[];
};
type AuthorityListItem = {
  id: string;
  location: string;
  uptime: string;
  reputation: string;
};
type AuthorityThresholdStatus = {
  val: string;
  inTheSet: boolean;
};
type AuthorityStats = {
  3;
  numberOfKeys: string;
  uptime: string;
  reputation: string;
  keyGenThreshold: AuthorityThresholdStatus;
  nextKeyGenThreshold: AuthorityThresholdStatus;
  pendingKeyGenThreshold: AuthorityThresholdStatus;
};

export function useThresholds(): Loadable<[Thresholds, UpcomingThreshold]> {}

export function useAuthorities(): Loadable<AuthorityListItem> {}

type AuthorityDetails = {
  stats: Loadable<AuthorityStats>;
  geyKens: Loadable<Page<PublicKeyListView>>;
};

export function useAuthority(): AuthorityDetails {}
