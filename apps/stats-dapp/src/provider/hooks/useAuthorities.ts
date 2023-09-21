import {
  AccountMetaDataFragment,
  IntFilter,
  useAccountMetaDataLazyQuery,
  useSessionThresholdHistoryLazyQuery,
  useSessionThresholdsLazyQuery,
  useValidatorListingLazyQuery,
  useValidatorOfSessionLazyQuery,
  useValidatorSessionsLazyQuery,
  useLatestSessionIdQuery,
  useAuthorityUptimesQuery,
} from '../../generated/graphql';
import { thresholdMap } from '../hooks/mappers/thresholds';
import { mapAuthorities, mapSessionAuthValidatorNode } from './mappers';
import { Loadable, Page, PageInfoQuery } from './types';
import { useCurrentMetaData } from './useCurrentMetaData';
import { PublicKey } from './useKeys';
import { useActiveSession } from '../stats-provider';
import { useEffect, useMemo, useState } from 'react';
import { useReputations } from './useReputation';

export type AuthoritySet = {
  count: number;
  firstElements: string[];
};

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

export type UpcomingThresholdStats = 'Next';

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
  stats: 'Next';
  session: string;
  keyGen: string;
  signature: string;
  proposer: string;
  authoritySet: AuthoritySet;
};

export type UpcomingThresholds = Record<
  Lowercase<UpcomingThresholdStats>,
  UpcomingThreshold
>;

/**
 * Authority list item
 * @param id - Authority account id
 * @param location - Authority location
 * @param uptime - Validator uptime
 * @param authorityId - Authority id
 * */
export type AuthorityListItem = {
  id: string;
  location?: string;
  uptime: number;
  reputation: number;
  authorityId: string;
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
  uptime: number;
  reputation: number;
  location: string | null;
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
  authority: {
    count: number;
    firstElements: string[];
  };
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
  const activeSession = useActiveSession();
  const [call, query] = useSessionThresholdsLazyQuery();

  useEffect(() => {
    if (session.val) {
      call({ variables: { sessionId: session.val.activeSession } }).catch(
        () => {
          setData({
            val: null,
            isFailed: true,
            error: 'failed to query the session',
            isLoading: false,
          });
        }
      );
    }
  }, [session, call]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<[Thresholds, UpcomingThresholds]> => {
        if (res.data && res.data.session) {
          const session = res.data.session;

          const thresholds = thresholdMap(session.thresholds);
          const keyGen = thresholds.KEY_GEN;
          const signature = thresholds.SIGNATURE;

          const publicKey = session.publicKey ?? {
            id: '',
            compressed: '',
            uncompressed: '',
          };

          const allAuth = mapAuthorities(session?.sessionValidators);
          const authSet = allAuth.map((auth) => auth.id);
          const nextAuthSet = allAuth
            .filter((auth) => auth.isNext)
            .map((auth) => auth.id);

          const keyGenThreshold = keyGen;
          const signatureThreshold = signature;
          const proposersCount = session.proposersCount.totalCount;
          const sessionTimeStamp = session.block?.timestamp;

          const threshold: Thresholds = {
            keyGen: keyGenThreshold ? String(keyGenThreshold.current) : '-',
            publicKey: {
              id: publicKey.id,
              session: session.id,
              end: sessionTimeStamp
                ? new Date(
                    new Date(sessionTimeStamp).getTime() + 60 * 60 * 1000
                  )
                : undefined,
              start: sessionTimeStamp ? new Date(sessionTimeStamp) : undefined,
              compressed: publicKey.compressed ?? '',
              uncompressed: '',
              keyGenAuthorities: authSet,
              isCurrent: activeSession === session.id,
              isDone: Number(activeSession) > Number(session.id),
            },
            proposer: '',
            signature: signatureThreshold
              ? String(signatureThreshold.current)
              : '-',
          };

          const next: UpcomingThreshold = {
            authoritySet: {
              count: nextAuthSet.length,
              firstElements: nextAuthSet.slice(0, 3),
            },
            keyGen: String(keyGenThreshold?.next ?? '-'),
            signature: String(signatureThreshold?.next ?? '-'),
            proposer: String(proposersCount),
            session: String(Number(session.id) + 1),
            stats: 'Next',
          };

          return {
            isLoading: false,
            isFailed: false,
            val: [
              threshold,
              {
                next,
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
  }, [query, activeSession]);

  return data;
}

export type Range = [number | undefined, number | undefined] | [];

function rangeIntoIntFilter(range: Range): IntFilter | null {
  const filter = {} as IntFilter;

  if (typeof range[0] !== 'undefined') {
    filter.greaterThanOrEqualTo = range[0];
  }
  if (typeof range[1] !== 'undefined') {
    filter.lessThanOrEqualTo = range[1];
  }

  if (Object.keys(filter).length === 0) {
    return null;
  }
  return filter;
}

type AuthorizesFilter = {
  uptime?: Range;
  reputation?: Range;
  countries?: string[];
  search?: string;
};
export type AuthorisesQuery = PageInfoQuery<AuthorizesFilter>;

export function useAuthorities(
  reqQuery: PageInfoQuery<AuthorizesFilter>
): Loadable<Page<AuthorityListItem>> {
  const [authorities, setAuthorities] = useState<
    Loadable<Page<AuthorityListItem>>
  >({
    val: null,
    isLoading: true,
    isFailed: false,
  });
  const [call, query] = useValidatorListingLazyQuery();
  const authorityReputations = useReputations();

  const authoritiesUptime = useAuthorityUptimesQuery({
    pollInterval: 1000,
    fetchPolicy: 'cache-and-network',
  });

  const authoritiesUptimes = useMemo(() => {
    return authoritiesUptime.data?.authorityUpTimes?.nodes;
  }, [authoritiesUptime]);

  const latestIndexedSessionId = useLatestSessionIdQuery({
    pollInterval: 1000,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (
      latestIndexedSessionId.data &&
      latestIndexedSessionId.data.sessions?.totalCount
    ) {
      call({
        variables: {
          offset: reqQuery.offset,
          perPage: reqQuery.perPage,
          sessionId:
            String(latestIndexedSessionId.data?.sessions?.totalCount - 1) ??
            '0',
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
  }, [reqQuery, call, latestIndexedSessionId]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<Page<AuthorityListItem>> => {
        if (res.data && res.data.sessionValidators) {
          const sessionValidators = res.data.sessionValidators;
          const items = sessionValidators.nodes
            .filter((v) => v !== null)
            .map((sessionValidator): AuthorityListItem => {
              const auth = mapSessionAuthValidatorNode(sessionValidator as any);
              const authority = authoritiesUptimes?.find(
                (item) => item?.authorityId === auth.id
              );
              const uptime = authority ? authority.uptime : 0;

              return {
                id: auth.id,
                location: auth.location ?? undefined,
                uptime: uptime,
                reputation: auth
                  ? (auth.reputation /
                      authorityReputations.highestReputationScore) *
                    100
                  : 0,
                authorityId: auth.authorityId,
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
      .subscribe(setAuthorities);
    return () => subscription.unsubscribe();
  }, [query, authoritiesUptimes, authorityReputations]);

  return authorities;
}

export type AuthorityQuery = PageInfoQuery<{
  authorityId: string;
}>;

export function useAuthority(pageQuery: AuthorityQuery): AuthorityDetails {
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
  const latestIndexedSessionId = useLatestSessionIdQuery({
    pollInterval: 1000,
    fetchPolicy: 'network-only',
  });
  const { authorityId } = pageQuery.filter;
  const [callKeyGen, queryKeyGen] = useValidatorSessionsLazyQuery();
  const [callValidatorOfSession, queryValidatorOfSession] =
    useValidatorOfSessionLazyQuery();
  const authorityReputations = useReputations();

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
    if (
      latestIndexedSessionId.data &&
      latestIndexedSessionId.data.sessions?.totalCount
    ) {
      callValidatorOfSession({
        variables: {
          sessionValidatorId: `${
            latestIndexedSessionId.data?.sessions?.totalCount - 1
          }-${authorityId}`,
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
  }, [latestIndexedSessionId, callValidatorOfSession, authorityId]);
  useEffect(() => {
    const subscription = queryKeyGen.observable
      .map((res): AuthorityDetails['keyGens'] => {
        if (res.data && res.data.sessionValidators) {
          const sessionValidators = res.data.sessionValidators;
          const items = sessionValidators.nodes
            // Ensure only session with public keys
            .filter((n) => Boolean(n?.session?.publicKey))
            .map((node): KeyGenKeyListItem => {
              const session = node && node.session ? node.session : null;
              const publicKey =
                session && session.publicKey
                  ? session.publicKey
                  : {
                      id: '',
                      compressed: '',
                      uncompressed: '',
                    };
              return {
                id: publicKey.id,
                session: session && session.id ? session.id : '',
                publicKey: publicKey.compressed ?? '',
                height: `${publicKey.block?.number ?? '-'}`,
                authority: {
                  count: session.sessionValidators.totalCount,
                  firstElements: session.sessionValidators.edges
                    .map((i) => i.node?.validator?.id)
                    .filter((i) => i !== undefined) as string[],
                },
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
          const counter = sessionValidators?.aggregates?.distinctCount
            ?.id as number;
          const session = sessionValidator.session!;
          const thresholds = thresholdMap(session.thresholds);
          const keyGen = thresholds.KEY_GEN;

          const auth = mapSessionAuthValidatorNode(sessionValidator);

          const stats: AuthorityStats = {
            numberOfKeys: String(counter),
            location: auth.location,
            keyGenThreshold: {
              val: String(keyGen?.current ?? '-'),
              inTheSet: auth.isBest,
            },
            nextKeyGenThreshold: {
              val: String(keyGen?.next ?? '-'),
              inTheSet: auth.isNextBest,
            },
            pendingKeyGenThreshold: {
              val: String(keyGen?.pending ?? '-'),
              inTheSet: auth.isBest,
            },
            reputation:
              (Number(auth.reputation) /
                authorityReputations.highestReputationScore) *
              100,
            uptime: Number(auth?.uptime ?? 0) * Math.pow(10, -7),
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
  }, [queryValidatorOfSession, authorityReputations]);
  return useMemo(() => ({ stats, keyGens }), [stats, keyGens]);
}

export function useSessionHistory(
  pageQuery: PageInfoQuery
): Loadable<Page<SessionThresholdEntry>> {
  const [sessionHistory, setSessionHistory] = useState<
    Loadable<Page<SessionThresholdEntry>>
  >({
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
          const items: SessionThresholdEntry[] = res.data.sessions.nodes.map(
            (node) => {
              const thresholds = thresholdMap(node!.thresholds);
              const keyGen = thresholds.KEY_GEN;
              const signature = thresholds.SIGNATURE;

              return {
                sessionId: node?.id ?? '',
                keyGenThreshold: String(keyGen?.current ?? '-'),
                signatureThreshold: String(signature?.current ?? '-'),
              };
            }
          );
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

type AuthorityAccountDetailsQuery = Loadable<
  Omit<AccountMetaDataFragment, '__typename'>
>;

export function useAuthorityAccount(
  accountId?: string
): AuthorityAccountDetailsQuery {
  const [account, setAccount] = useState<AuthorityAccountDetailsQuery>({
    val: null,
    isFailed: false,
    isLoading: false,
    error: undefined,
  });
  const [call, query] = useAccountMetaDataLazyQuery();

  useEffect(() => {
    const sub = query.observable
      .map((account): AuthorityAccountDetailsQuery => {
        if (account.data?.account) {
          const { __typename, ...data } = account.data.account;
          return {
            isLoading: false,
            val: data,
            error: undefined,
            isFailed: false,
          };
        }
        return {
          val: null,
          isLoading: account.loading,
          isFailed: Boolean(account.error),
          error: account.error?.message,
        };
      })
      .subscribe(setAccount);
    return () => sub.unsubscribe();
  }, [query, setAccount]);

  useEffect(() => {
    if (accountId) {
      call({
        variables: {
          accountId,
        },
      }).catch((e) => {
        setAccount({
          val: null,
          isFailed: true,
          isLoading: false,
          error: e.message,
        });
      });
    } else {
      setAccount({
        isLoading: false,
        val: null,
        error: undefined,
        isFailed: false,
      });
    }
  }, [accountId]);
  return account;
}
