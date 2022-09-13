import { useSessionThresholdsLazyQuery } from '@webb-dapp/page-statistics/generated/graphql';
import { DKGAuthority, Loadable, Page } from '@webb-dapp/page-statistics/provider/hooks/types';
import { useCurrentMetaData } from '@webb-dapp/page-statistics/provider/hooks/useCurrentMetaData';
import { PublicKey, PublicKeyListView } from '@webb-dapp/page-statistics/provider/hooks/useKeys';
import { useEffect, useState } from 'react';

import { Threshold as QueryThreshold } from './types';

type Thresholds = {
  keyGen: string;
  signature: string;
  proposer: string;
  publicKey: PublicKey;
};
type UpcomingThresholdStats = 'Pending' | 'Next' | 'Current';
type UpcomingThreshold = {
  stats: 'Pending' | 'Next' | 'Current';
  session: string;
  keyGen: string;
  signature: string;
  proposer: string;
  authoritySet: string[];
};
type UpcomingThresholds = Record<Lowercase<UpcomingThresholdStats>, UpcomingThreshold>;
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
  numberOfKeys: string;
  uptime: string;
  reputation: string;
  keyGenThreshold: AuthorityThresholdStatus;
  nextKeyGenThreshold: AuthorityThresholdStatus;
  pendingKeyGenThreshold: AuthorityThresholdStatus;
};

export function useThresholds(): Loadable<[Thresholds, UpcomingThresholds]> {
  const [data, setData] = useState<Loadable<[Thresholds, UpcomingThresholds]>>({
    val: null,
    isFailed: false,
    isLoading: true,
  });

  const session = useCurrentMetaData();
  const [call, query] = useSessionThresholdsLazyQuery();
  useEffect(() => {
    if (session.val) {
      call({ variables: { sessionId: session.val.activeSession } }).catch((e) => {
        setData({
          val: null,
          isFailed: true,
          error: 'failed to query the session',
          isLoading: false,
        });
      });
    }
  }, [session, call]);
  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<[Thresholds, UpcomingThresholds]> => {
        if (res.data) {
          const session = res.data.session!;
          const publicKey = session.publicKey!;
          const authSet = session.authorities.map((auth: DKGAuthority) => auth.accountId);
          const nextAuthSet = session.nextAuthorities.map((auth: DKGAuthority) => auth.accountId);
          const keyGenThreshold = session.keyGenThreshold as QueryThreshold;
          const signatureThreshold = session.signatureThreshold as QueryThreshold;
          const threshold: Thresholds = {
            keyGen: String(keyGenThreshold.current),
            publicKey: {
              id: publicKey.id,
              session: session.id,
              start: new Date(publicKey.block?.timestamp),
              end: new Date(publicKey.block?.timestamp),
              compressed: publicKey.compressed!,
              uncompressed: publicKey.uncompressed!,
              keyGenAuthorities: authSet,
              isCurrent: false,
            },
            proposer: '',
            signature: String(signatureThreshold.current),
          };
          const current: UpcomingThreshold = {
            authoritySet: authSet,
            keyGen: String(keyGenThreshold.current),
            signature: String(signatureThreshold.current),
            proposer: '',
            session: session.id,
            stats: 'Current',
          };

          const pending: UpcomingThreshold = {
            authoritySet: nextAuthSet,
            keyGen: String(keyGenThreshold.pending),
            signature: String(signatureThreshold.pending),
            proposer: '',
            session: session.id,
            stats: 'Pending',
          };

          const next: UpcomingThreshold = {
            authoritySet: nextAuthSet,
            keyGen: String(keyGenThreshold.next),
            signature: String(signatureThreshold.next),
            proposer: '',
            session: session.id,
            stats: 'Next',
          };

          return {
            isLoading: false,
            isFailed: false,
            val: [
              threshold,
              {
                next,
                pending,
                current,
              },
            ],
          };
        }

        return {
          isLoading: res.loading,
          isFailed: Boolean(res.error),
          error: res.error?.message ?? undefined,
          val: null,
        };
      })
      .subscribe(setData);

    return () => subscription.unsubscribe();
  }, [query]);
  return data;
}

export function useAuthorities(): Loadable<AuthorityListItem> {
  throw new Error('Not implemented');
}

type AuthorityDetails = {
  stats: Loadable<AuthorityStats>;
  geyKens: Loadable<Page<PublicKeyListView>>;
};

export function useAuthority(): AuthorityDetails {
  throw new Error('Not implemented');
}
