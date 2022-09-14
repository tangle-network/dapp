import {
  useSessionThresholdsLazyQuery,
  useValidatorListingLazyQuery,
} from '@webb-dapp/page-statistics/generated/graphql';
import { mapAuthorities } from '@webb-dapp/page-statistics/provider/hooks/mappers';
import { Loadable, Page, PageInfoQuery } from '@webb-dapp/page-statistics/provider/hooks/types';
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
          const allAuth = mapAuthorities(session?.sessionValidators);
          const authSet = allAuth.map((auth) => auth.id);
          const nextAuthSet = allAuth.filter((auth) => auth.isNext).map((auth) => auth.id);
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

export function useAuthorities(reqQuery: PageInfoQuery): Loadable<Page<AuthorityListItem>> {
  const [authorities, setAuthorities] = useState<Loadable<Page<AuthorityListItem>>>({
    val: null,
    isLoading: true,
    isFailed: false,
  });
  const metaData = useCurrentMetaData();
  const [call, query] = useValidatorListingLazyQuery();
  // fetch the data once the filter has changed
  useEffect(() => {
    if (metaData.val) {
      call({
        variables: {
          offset: reqQuery.offset,
          perPage: reqQuery.perPage,
          sessionId: metaData.val.activeSession,
        },
      }).catch((e) => {
        setAuthorities({
          val: null,
          isFailed: true,
          isLoading: false,
          error: e.message,
        });
      });
    }
  }, [reqQuery, call, metaData]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<Page<AuthorityListItem>> => {
        if (res.data && res.data.validators) {
          const validators = res.data.validators;
          const items = validators.nodes.map((validator): AuthorityListItem => {
            const auth = mapAuthorities(validator?.sessionValidators!);
            return {
              id: validator?.id!,
              location: 'any',
              uptime: '50',
              reputation: auth[0].reputation ?? '0',
            };
          });
          return {
            isLoading: false,
            isFailed: false,
            val: {
              items,
              pageInfo: {
                count: validators.totalCount,
                hasPrevious: validators.pageInfo.hasPreviousPage,
                hasNext: validators.pageInfo.hasNextPage,
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
      .subscribe(setAuthorities);
    return () => subscription.unsubscribe();
  }, [query]);

  return authorities;
}

type AuthorityDetails = {
  stats: Loadable<AuthorityStats>;
  geyKens: Loadable<Page<PublicKeyListView>>;
};

export function useAuthority(): AuthorityDetails {
  throw new Error('Not implemented');
}
