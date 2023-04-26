import {
  PublicKeysQuery,
  usePublicKeysQuery,
  usePublicKeyLazyQuery,
  usePublicKeysLazyQuery,
  useSessionKeyIdsLazyQuery,
  useSessionKeysLazyQuery,
} from '../../generated/graphql';
import { mapAuthorities } from './mappers';
import { thresholdMap } from '../hooks/mappers/thresholds';
import { useCurrentMetaData } from './useCurrentMetaData';
import {
  useActiveSession,
  useStaticConfig,
  useStatsContext,
} from '../stats-provider';
import { useEffect, useState } from 'react';

import {
  Loadable,
  Page,
  PageInfoQuery,
  SessionKeyHistory,
  SessionKeyStatus,
  Threshold,
} from './types';

/**
 *  Public key shared content
 *  @param id - public key id
 *  @param uncompressed - Uncompressed public key value
 *  @param compressed - Compressed public key value
 *  @param start - The time when the public key started taking effect and be the active key
 *  @param end - The time when the public key stopped taking effect and be the active key
 *  @param session - The session id for that key (Life time of the key)
 * */
type PublicKeyContent = {
  id: string;

  uncompressed: string;
  compressed: string;

  start?: Date;
  end?: Date;
  session: string;
};

/**
 * Public key with keygen authorities
 * @param isCurrent - The key is the current active key
 * @param keyGenAuthorities - Authorities set  that signed the key
 * */
export interface PublicKey extends PublicKeyContent {
  isCurrent: boolean;
  isDone: boolean;
  keyGenAuthorities: string[];
}

/**
 * @param height  - Block number when the key was generated
 * @param keyGenAuthorities - Authorities set  that signed the key
 * @param keyGenThreshold - keyGenThreshold Active session of that key
 * @param SignatureThreshold - SignatureThreshold Active session of that key
 * @param session - The session id for that key (Lifetime of the key)
 * @param previousKeyId - The previous key id for nagivation on the drawer
 * @param nextKeyId - The next key id for nagivation on the drawer
 * */
export interface PublicKeyListView extends PublicKeyContent {
  height: string;
  keyGenAuthorities: string[];
  keyGenThreshold: number | null;
  signatureThreshold: number | null;
  session: string;

  previousKeyId?: string;
  nextKeyId?: string;
}

/**
 * Public key progress history item
 * @param at - The date when the history item took place
 * @param hash - Transaction hash of that history item
 * @param status - The status of the history item
 * */
type PublicKeyHistoryEntry = {
  at: Date;
  hash: string;
  status: SessionKeyStatus;
};
/**
 * @param id - Authority id
 * @param account - account 32 for that authority
 * @param location - The location of that authority
 * @param uptime - Authority validator uptime
 * @params reputation - The P2P reputation of that authority
 *
 * */
export type KeyGenAuthority = {
  id: string;
  account: string;
  location: string;
  uptime: number;
  reputation: number;
};

/**
 * The full date of that public key
 * @param height  - Block number when the key was generated
 * @param isCurrent - The key is the current active key
 * @param history - The progress of that key
 * @param keyGenThreshold - keyGenThreshold Active session of that key
 * @param signatureThreshold - signatureThreshold Active session of that key
 * @param numberOfValidators - The number of the validator running at the key being active
 * @param authorities - keygen authorities (Best Authorities) that signed the key
 * @param nextKeyId - The id of the next key if any
 * @param previousKeyId - the id of the previous key if any
 * */
interface PublicKeyDetails extends PublicKeyContent {
  height: string;
  isCurrent: boolean;
  isDone: boolean;
  history: PublicKeyHistoryEntry[];
  keyGenThreshold: number | null;
  signatureThreshold: number | null;
  numberOfValidators: number | null;
  authorities: Array<KeyGenAuthority>;
}
/**
 *
 * Next and previous key ids
 * @param nextKeyId - The id of the next key if any
 * @param previousKeyId - The id of the next key if any
 *
 * */
type NextAndPrevKeyStatus = {
  nextKeyId: string | null;
  previousKeyId: string | null;
};
/**
 *  Public key details page
 *  @param key - Public key details
 *  @param prevAndNextKey - Information about the next and previous key existence
 * */
type PublicKeyDetailsPage = {
  key: Loadable<PublicKeyDetails>;
  prevAndNextKey: Loadable<NextAndPrevKeyStatus>;
};

export function sessionFrame(
  timestamp?: string,
  sessionHeight?: number
): [startDateTime: Date, endTime: Date] | [] {
  if (!timestamp || !sessionHeight) {
    return [];
  }

  const startDateTime = new Date(timestamp);

  if (isNaN(startDateTime.getTime())) {
    console.error(`Invalid timestamp: ${timestamp}`);
    return [];
  }

  const endTime = new Date(startDateTime.getTime() + sessionHeight * 1000); // block timestamp milliseconds + session height in milliseconds

  return [startDateTime, endTime];
}

/**
 * List keys for table view
 *
 * @example
 * An example of using previous and next values
 * ```jsx
 *  const KeyDetailsPage = ({key}:{key:string}) => {
 *    const proposalDetailsPage = useKey(key);
 *    const nextAndPrevStatus = proposalDetailsPage.nextAndPrevStatus
 *    const hasNext = useMemo( () => prevAndNextKey.val?.nextKeyId !== null, [nextAndPrevStatus])
 *    const hasPrev = useMemo( () => prevAndNextKey.val?.previousKeyId !== null, [nextAndPrevStatus])
 *    return <div>
 *      <button  disabled={!hasPrev}>Next</button> <button disabled={!hasNext}>Prev</button>
 *    </div>
 *  }
 * ```
 * */
export function useKeys(
  reqQuery: PageInfoQuery,
  currentKey: PublicKey | null | undefined
): Loadable<Page<PublicKeyListView>> {
  const [call, query] = usePublicKeysLazyQuery();
  const { sessionHeight } = useStaticConfig();
  const { blockTime } = useStatsContext();
  const [page, setPage] = useState<Loadable<Page<PublicKeyListView>>>({
    val: null,
    isFailed: false,
    isLoading: true,
  });

  // fetch the data once the filter has changed
  useEffect(() => {
    call({
      variables: {
        offset: reqQuery.offset,
        PerPage: reqQuery.perPage,
      },
      fetchPolicy: 'network-only',
    }).catch((e) => {
      setPage({
        val: null,
        isFailed: true,
        isLoading: false,
        error: e.message,
      });
    });
  }, [reqQuery, call, currentKey]);
  // Handle the GraphQl call response

  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<Page<PublicKeyListView>> => {
        if (res.loading) {
          return {
            val: null,
            isFailed: false,
            isLoading: true,
          };
        }
        if (res.error) {
          return {
            val: null,
            error: res.error.message,
            isLoading: false,
            isFailed: true,
          };
        }
        if (res.data.publicKeys) {
          const data = res.data.publicKeys;

          const filteredData = data.nodes.filter((n) => !!n);

          return {
            isLoading: false,
            isFailed: false,
            val: {
              items: filteredData.map((node, idx) => {
                const session = node.sessions?.nodes[0];
                const thresholds = thresholdMap(
                  session ? session.thresholds : { nodes: [] }
                );
                const keyGen = thresholds.KEY_GEN;
                const signature = thresholds.SIGNATURE;
                const authorities = mapAuthorities(session.sessionValidators)
                  .filter((auth) => auth.isBest)
                  .map((auth) => auth.id);

                const previousKeyId = idx
                  ? filteredData[idx - 1]?.id
                  : undefined;
                const nextKeyId =
                  idx < filteredData.length - 1
                    ? filteredData[idx + 1]?.id
                    : undefined;
                const [start, end] = sessionFrame(
                  session.block?.timestamp,
                  sessionHeight
                );
                return {
                  height: String(node.block?.number),
                  session: session.id,
                  keyGenThreshold: keyGen?.current ?? null,
                  signatureThreshold: signature?.current ?? null,
                  compressed: node.compressed,
                  uncompressed: node.uncompressed,
                  keyGenAuthorities: authorities,
                  end,
                  start,
                  id: node.id,
                  previousKeyId,
                  nextKeyId,
                };
              }),
              pageInfo: {
                count: data.totalCount,
                hasNext: data.pageInfo.hasNextPage,
                hasPrevious: data.pageInfo.hasPreviousPage,
              },
            },
          };
        }
        return {
          val: null,
          isFailed: false,
          isLoading: false,
        };
      })
      .subscribe(setPage);

    return () => subscription.unsubscribe();
  }, [query, blockTime, sessionHeight]);

  return page;
}
/**
 * Get the current Public key (Current session active) and the next public key (Next session active)
 * */
export function useActiveKeys(): Loadable<[PublicKey, PublicKey]> {
  const metaData = useCurrentMetaData();
  const [call, query] = useSessionKeysLazyQuery();
  const { sessionHeight } = useStaticConfig();
  const { blockTime } = useStatsContext();

  const activeSession = useActiveSession();
  const [keys, setKeys] = useState<Loadable<[PublicKey, PublicKey]>>({
    val: null,
    isFailed: false,
    isLoading: true,
  });

  useEffect(() => {
    if (metaData.val) {
      call({
        variables: {
          SessionId: [
            metaData.val.activeSession,
            String(Number(metaData.val.activeSession) + 1),
          ],
        },
      }).catch((e) => {
        setKeys({
          val: null,
          isFailed: true,
          isLoading: false,
          error: e.message,
        });
      });
    }
  }, [metaData, call]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): Loadable<[PublicKey, PublicKey]> => {
        if (res.data) {
          const val: PublicKey[] =
            res.data.sessions?.nodes
              .filter((i) => i?.publicKey)
              .map((i) => {
                const keyGenAuthorities = mapAuthorities(i?.sessionValidators)
                  .filter((auth) => auth.isBest)
                  .map((auth) => auth.id);
                const publicKey = i?.publicKey;
                const session = i;
                const sessionTimeStamp = session?.block?.timestamp;
                const [start, end] = sessionFrame(
                  sessionTimeStamp,
                  sessionHeight
                );

                return {
                  id: publicKey?.id,
                  session: session?.id,
                  end,
                  start,
                  compressed: publicKey?.compressed,
                  uncompressed: publicKey?.uncompressed,
                  keyGenAuthorities,
                  isCurrent: activeSession === session?.id,
                  isDone: Number(activeSession) > Number(session?.id),
                };
              }) || [];

          const activeKey = val[0];
          const nextKey = val[1];
          return {
            val: [
              activeKey,
              {
                ...nextKey,
                start: activeKey?.end,
              },
            ],
            isFailed: false,
            isLoading: false,
          };
        }

        if (res.error) {
          return {
            val: null,
            isFailed: true,
            isLoading: false,
            error: res.error.message,
          };
        }

        return {
          val: null,
          isFailed: true,
          isLoading: false,
        };
      })
      .subscribe(setKeys);

    return () => subscription.unsubscribe();
  }, [query, activeSession, blockTime, sessionHeight, metaData]);

  return keys;
}

/**
 * Graphql query to get the public key details
 * @param id : public key id
 *
 * */
export function useKey(id: string): PublicKeyDetailsPage {
  const [call, query] = usePublicKeyLazyQuery();
  const [callSessionKeys, sessionKeysQuery] = useSessionKeyIdsLazyQuery();
  const [key, setKey] = useState<Loadable<PublicKeyDetails>>({
    val: null,
    isFailed: false,
    isLoading: true,
  });
  const { sessionHeight } = useStaticConfig();
  const { blockTime } = useStatsContext();
  const activeSession = useActiveSession();
  const [prevAndNextKey, setPrevAndNextKey] = useState<
    Loadable<NextAndPrevKeyStatus>
  >({
    val: null,
    isFailed: false,
    isLoading: true,
  });
  useEffect(() => {
    call({
      variables: {
        id,
      },
    }).catch((e) => {
      setKey({
        val: null,
        isFailed: true,
        isLoading: false,
        error: e.message,
      });
    });
  }, [id, call]);

  useEffect(() => {
    const subscription = query.observable

      .map((res): Loadable<PublicKeyDetails> => {
        if (res.data) {
          const publicKey = res.data.publicKey;
          const session = publicKey.sessions?.nodes[0];
          const history: PublicKeyHistoryEntry[] = (
            publicKey.history as SessionKeyHistory[]
          ).map((val) => {
            return {
              at: new Date(val.timestamp),
              status: val.stage,
              hash: val.txHash,
            };
          });
          const sessionAuthorities = mapAuthorities(session.sessionValidators);
          const authorities = sessionAuthorities
            .filter((auth) => auth.isBest)
            .map((auth): KeyGenAuthority => {
              return {
                account: auth.id,
                id: auth.id,
                location: 'any',
                reputation: Number(auth.reputation) * Math.pow(10, -7),
                uptime: Number(auth.uptime) * Math.pow(10, -7),
              };
            });
          const validators = sessionAuthorities.length;
          const [start, end] = sessionFrame(
            session.block?.timestamp,
            sessionHeight
          );
          const thresholds = thresholdMap(session.thresholds);
          const keyGen = thresholds.KEY_GEN;
          const signature = thresholds.SIGNATURE;
          return {
            isFailed: false,
            isLoading: false,
            val: {
              height: publicKey.block?.number,
              compressed: publicKey.compressed,
              uncompressed: publicKey.uncompressed,
              id: publicKey.id,
              session: session.id,
              end,
              start,
              history,
              numberOfValidators: validators,
              isCurrent: activeSession === session.id,
              isDone: Number(activeSession) > Number(session.id),
              authorities,
              keyGenThreshold: keyGen?.current ?? null,
              signatureThreshold: signature?.current ?? null,
            },
          };
        }
        return {
          val: null,
          isFailed: Boolean(res.error),
          isLoading: false,
          error: res.error?.message,
        };
      })
      .subscribe((val) => {
        if (val.val) {
          const sessionId = Number(val.val.session);
          const sessionIds = [Math.max(sessionId - 1, 0), sessionId + 1].map(
            (v) => String(v)
          );
          callSessionKeys({
            variables: {
              keys: sessionIds,
            },
          }).catch((e) => {
            console.log(e);
          });
        }
        setKey(val);
      });
    return () => subscription.unsubscribe();
  }, [callSessionKeys, query, activeSession, sessionHeight, blockTime]);

  useEffect(() => {
    const subscription = sessionKeysQuery.observable
      .map((res): Loadable<NextAndPrevKeyStatus> => {
        if (res.data && res.data.sessions) {
          const sessions = res.data.sessions.nodes;
          const map = sessions
            .filter((s) => s && s.publicKey)
            .map((s) => [s.id, s.publicKey.id]);
          const [prev, next] = sessionKeysQuery.variables.keys as string[];
          return {
            isLoading: false,
            val: {
              nextKeyId: map.find((i) => i[0] === next)?.[1] || null,
              previousKeyId: map.find((i) => i[0] === prev)?.[1] || null,
            },
            isFailed: false,
          };
        }
        return {
          val: null,
          isFailed: Boolean(res.error),
          isLoading: false,
          error: res.error?.message,
        };
      })
      .subscribe(setPrevAndNextKey);
    return () => subscription.unsubscribe();
  }, [sessionKeysQuery, setPrevAndNextKey]);
  return { key, prevAndNextKey };
}
