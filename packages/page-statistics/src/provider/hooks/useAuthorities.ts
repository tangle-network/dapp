import {
  useSessionThresholdHistoryLazyQuery,
  useSessionThresholdsLazyQuery,
  useValidatorListingLazyQuery,
  useValidatorOfSessionLazyQuery,
  useValidatorSessionsLazyQuery,
} from '@webb-dapp/page-statistics/generated/graphql';
import { mapAuthorities, mapSessionAuthValidatorNode } from '@webb-dapp/page-statistics/provider/hooks/mappers';
import { Loadable, Page, PageInfoQuery } from '@webb-dapp/page-statistics/provider/hooks/types';
import { useCurrentMetaData } from '@webb-dapp/page-statistics/provider/hooks/useCurrentMetaData';
import { PublicKey } from '@webb-dapp/page-statistics/provider/hooks/useKeys';
import { useEffect, useMemo, useState } from 'react';

import { Threshold as QueryThreshold } from './types';
/**
 * Threshold values
 * @param keyGen - KeyGen threshold
 * @param signature - Signature threshold
 * @param proposer - Proposer threshold
 * @param publicKey - Public key for a session
 *
 * */
export type Thresholds = {
  keyGen: string;
  signature: string;
  proposer: string;
  publicKey: PublicKey;
};

export type UpcomingThresholdStats = 'Pending' | 'Next' | 'Current';

/**
 * Upcoming threshold stats
 * @param stats - Indicate the status of upcoming threshold
 * @param session - Stats session id
 * @param keyGen - KeyGen threshold
 * @param signature - Signature threshold
 * @param proposer - Proposer threshold
 * @param authoritySet - list of the authorities
 *
 * */
export type UpcomingThreshold = {
  stats: 'Pending' | 'Next' | 'Current';
  session: string;
  keyGen: string;
  signature: string;
  proposer: string;
  // TODO use the type `DiscreteList`
  authoritySet: string[];
};

export type UpcomingThresholds = Record<Lowercase<UpcomingThresholdStats>, UpcomingThreshold>;

/**
 * Authority list item
 * @param id - Authority id
 * @param location - Authority location
 * @param uptime - Validator uptime
 * */
type AuthorityListItem = {
  id: string;
  location: string;
  uptime: string;
  reputation: string;
};

/**
 *  Proposer threshold and wither an authority is in the set
 *  val: proposer threshold
 *  inSet: whether an authority is in the set
 *
 * */
type AuthorityThresholdStatus = {
  val: string;
  inTheSet: boolean;
};

/**
 * Authority  statistics
 * @param numberOfKeys - Number of keys the authority had participated in
 * @param uptime - The authority validator uptime
 * @param reputation - The authority validator reputation
 * @param keyGenThreshold - KeyGen threshold and wither the authority is in the set
 * @param signatureThreshold - Signature threshold and wither the authority is in the set
 * @param pendingKeyGenThreshold - Pending KeyGen threshold
 **/
export type AuthorityStats = {
  numberOfKeys: string;
  uptime: string;
  reputation: string;
  keyGenThreshold: AuthorityThresholdStatus;
  nextKeyGenThreshold: AuthorityThresholdStatus;
  pendingKeyGenThreshold: AuthorityThresholdStatus;
};

/**
 * Keygen list items
 * @param id - Keygen id
 * @param height - Keygen block number
 * @param session - Keygen session id
 * @param publicKey - Keygen public key
 * */
export type KeyGenKeyListItem = {
  id: string;
  height: string;
  session: string;
  publicKey: string;
  authority: string;
};

type AuthorityDetails = {
  stats: Loadable<AuthorityStats>;
  keyGens: Loadable<Page<KeyGenKeyListItem>>;
};

/**
 * Session threshold
 * @param sessionId - Session identifier
 * @param keyGenThreshold - KeyGen threshold value
 * @param signatureThreshold - Signature threshold value
 * */
type SessionThresholdEntry = {
  sessionId: string;
  signatureThreshold: string;
  keyGenThreshold: string;
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

export function useAuthority(pageQuery: PageInfoQuery, authorityId: string): AuthorityDetails {
  const [stats, setStats] = useState<AuthorityDetails['stats']>({
    isFailed: false,
    isLoading: true,
    val: null,
  });
  const [keyGens, setKeyGens] = useState<AuthorityDetails['keyGens']>({
    isFailed: false,
    isLoading: true,
    val: null,
  });
  const metaData = useCurrentMetaData();

  const [callKeyGen, queryKeyGen] = useValidatorSessionsLazyQuery();
  const [callValidatorOfSession, queryValidatorOfSession] = useValidatorOfSessionLazyQuery();
  useEffect(() => {
    callKeyGen({
      variables: {
        offset: pageQuery.offset,
        perPage: pageQuery.perPage,
        keyGen: true,
        validatorId: authorityId,
      },
    }).catch((e) => {
      setKeyGens({
        val: null,
        isFailed: true,
        isLoading: false,
        error: e.message,
      });
    });
  }, [authorityId, callKeyGen, setKeyGens, pageQuery]);
  useEffect(() => {
    if (metaData.val) {
      callValidatorOfSession({
        variables: {
          sessionValidatorId: `${metaData.val.activeSession}-${authorityId}`,
          validatorId: authorityId,
        },
      }).catch((e) => {
        setStats({
          val: null,
          isFailed: true,
          isLoading: false,
          error: e.message,
        });
      });
    }
  }, [metaData, callValidatorOfSession, authorityId]);
  useEffect(() => {
    const subscription = queryKeyGen.observable
      .map((res): AuthorityDetails['keyGens'] => {
        if (res.data && res.data.sessionValidators) {
          const sessionValidators = res.data.sessionValidators;
          const items = sessionValidators.nodes.map((node): KeyGenKeyListItem => {
            const session = node?.session!;
            const publicKey = session.publicKey!;
            return {
              id: publicKey.id,
              session: session.id,
              publicKey: publicKey.uncompressed!,
              height: '0',
              authority: String(session.sessionValidators.totalCount),
            };
          });
          return {
            isLoading: false,
            isFailed: false,
            val: {
              items,
              pageInfo: {
                count: sessionValidators.totalCount,
                hasPrevious: sessionValidators.pageInfo.hasPreviousPage,
                hasNext: sessionValidators.pageInfo.hasNextPage,
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
      .subscribe(setKeyGens);
    return () => subscription.unsubscribe();
  }, [queryKeyGen]);
  useEffect(() => {
    const subscription = queryValidatorOfSession.observable
      .map((res): AuthorityDetails['stats'] => {
        if (res.data && res.data.sessionValidator) {
          const sessionValidator = res.data.sessionValidator;
          const sessionValidators = res.data.sessionValidators;
          const counter = sessionValidators?.aggregates?.distinctCount?.id as number;
          const threshold = sessionValidator.session?.keyGenThreshold! as QueryThreshold;
          const auth = mapSessionAuthValidatorNode(sessionValidator);
          const stats: AuthorityStats = {
            numberOfKeys: String(counter),
            keyGenThreshold: {
              val: String(threshold.current),
              inTheSet: auth.isBest,
            },
            nextKeyGenThreshold: {
              val: String(threshold.next),
              inTheSet: auth.isNextBest,
            },
            pendingKeyGenThreshold: {
              val: String(threshold.pending),
              inTheSet: auth.isBest,
            },
            reputation: auth.reputation,
            uptime: '100',
          };
          return {
            error: '',
            isFailed: false,
            isLoading: false,
            val: stats,
          };
        }
        return {
          isLoading: res.loading,
          isFailed: Boolean(res.error),
          error: res.error?.message ?? undefined,
          val: null,
        };
      })
      .subscribe(setStats);
    return () => subscription.unsubscribe();
  }, [queryValidatorOfSession]);
  return useMemo(() => ({ stats, keyGens }), [stats, keyGens]);
}

export function useSessionHistory(pageQuery: PageInfoQuery): Loadable<Page<SessionThresholdEntry>> {
  const [sessionHistory, setSessionHistory] = useState<Loadable<Page<SessionThresholdEntry>>>({
    isFailed: false,
    isLoading: false,
    val: null,
  });

  const [call, query] = useSessionThresholdHistoryLazyQuery();

  useEffect(() => {
    call({
      variables: {
        offset: pageQuery.offset,
        perPage: pageQuery.perPage,
      },
    }).catch((e) => {
      setSessionHistory({
        val: null,
        isFailed: true,
        isLoading: false,
        error: e.message,
      });
    });
  }, [pageQuery, setSessionHistory, call]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<Page<SessionThresholdEntry>> => {
        if (res.data.sessions) {
          const items: SessionThresholdEntry[] = res.data.sessions.nodes.map((node) => {
            return {
              sessionId: node?.id!,
              keyGenThreshold: String((node?.keyGenThreshold! as QueryThreshold).current!),
              signatureThreshold: String((node?.signatureThreshold! as QueryThreshold).current!),
            };
          });
          return {
            error: '',
            isFailed: false,
            isLoading: false,
            val: {
              items,
              pageInfo: {
                count: res.data.sessions.totalCount,
                hasPrevious: res.data.sessions.pageInfo.hasPreviousPage,
                hasNext: res.data.sessions.pageInfo.hasNextPage,
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
      .subscribe(setSessionHistory);
    return () => subscription.unsubscribe();
  }, [query]);

  return sessionHistory;
}
