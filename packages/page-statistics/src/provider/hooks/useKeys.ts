import {
  usePublicKeyLazyQuery,
  usePublicKeysLazyQuery,
  useSessionKeysLazyQuery,
} from '@webb-dapp/page-statistics/generated/graphql';
import { mapAuthorities } from '@webb-dapp/page-statistics/provider/hooks/mappers';
import { useCurrentMetaData } from '@webb-dapp/page-statistics/provider/hooks/useCurrentMetaData';
import { useEffect, useState } from 'react';

import { Loadable, Page, PageInfoQuery, SessionKeyHistory, SessionKeyStatus, Threshold } from './types';

/**
 *  Public key shared content
 *  @param id - public key id
 *  @param uncompressed - Uncompressed public key value
 *  @param compressed - Compressed public key value
 *  @params start - The time when the public key started taking effect and be the active key
 *  @params end - The time when the public key stopped taking effect and be the active key
 *  @param session - The session id for that key (Life time of the key)
 * */
type PublicKeyContent = {
  id: string;

  uncompressed: string;
  compressed: string;

  start: Date;
  end: Date;
  session: string;
};

/**
 * Public key with keygen authorities
 * @param isCurrent - The key is the current active key
 * @param keyGenAuthorities - Authorities set  that signed the key
 * */
export interface PublicKey extends PublicKeyContent {
  isCurrent: boolean;
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
  keyGenThreshold: string;
  signatureThreshold: string;
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
 * */
interface PublicKeyDetails extends PublicKeyContent {
  height: string;
  isCurrent: boolean;
  history: PublicKeyHistoryEntry[];
  keyGenThreshold: string;
  signatureThreshold: string;
  numberOfValidators: number;
  authorities: Array<KeyGenAuthority>;
}

/**
 * List keys for table view
 * */
export function useKeys(reqQuery: PageInfoQuery): Loadable<Page<PublicKeyListView>> {
  const [call, query] = usePublicKeysLazyQuery();
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
    }).catch((e) => {
      setPage({
        val: null,
        isFailed: true,
        isLoading: false,
        error: e.message,
      });
    });
  }, [reqQuery, call]);
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
                const session = node!.sessions?.nodes[0]!;
                const authorities = mapAuthorities(session.sessionValidators)
                  .filter((auth) => auth.isBest)
                  .map((auth) => auth.id);

                const previousKeyId = idx ? filteredData[idx - 1]?.id : undefined;
                const nextKeyId = idx < filteredData.length - 1 ? filteredData[idx + 1]?.id : undefined;

                return {
                  height: String(node!.block?.number),
                  session: session.id,
                  signatureThreshold: String(session.signatureThreshold.current),
                  keyGenThreshold: String(session.keyGenThreshold.current),
                  compressed: node!.compressed!,
                  uncompressed: node!.uncompressed!,
                  keyGenAuthorities: authorities,
                  end: new Date(node!.block?.timestamp),
                  start: new Date(node!.block?.timestamp),
                  id: node!.id,
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
  }, [query]);
  return page;
}

/**
 * Get the current Public key (Current session active) and the next public key (Next session active)
 * */
export function useActiveKeys(): Loadable<[PublicKey, PublicKey]> {
  const metaData = useCurrentMetaData();
  const [call, query] = useSessionKeysLazyQuery();
  const [keys, setKeys] = useState<Loadable<[PublicKey, PublicKey]>>({
    val: null,
    isFailed: false,
    isLoading: true,
  });
  useEffect(() => {
    if (metaData.val) {
      call({
        variables: {
          SessionId: [metaData.val.activeSession, metaData.val.lastSession],
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
            res.data.sessions?.nodes.map((i) => {
              const keyGenAuthorities = mapAuthorities(i?.sessionValidators!)
                .filter((auth) => auth.isBest)
                .map((auth) => auth.id);
              const publicKey = i!.publicKey!;
              return {
                id: publicKey.id,
                session: i!.id,
                end: new Date(publicKey.block!.timestamp),
                start: new Date(publicKey.block!.timestamp),
                compressed: publicKey.compressed!,
                uncompressed: publicKey.uncompressed!,
                keyGenAuthorities,
                isCurrent: true,
              };
            }) || [];
          return {
            val: [val[0], val[1]],
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
  }, [query]);
  return keys;
}

/**
 * Graphql query to get the public key details
 * @param id : public key id
 *
 * */
export function useKey(id: string): Loadable<PublicKeyDetails> {
  const [call, query] = usePublicKeyLazyQuery();

  const [key, setKey] = useState<Loadable<PublicKeyDetails>>({
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
          const publicKey = res.data.publicKey!;
          const session = publicKey.sessions?.nodes[0]!;
          const history: PublicKeyHistoryEntry[] = (publicKey.history as SessionKeyHistory[]).map((val) => {
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
                id: auth.authorityId,
                location: 'any',
                reputation: Number(auth.reputation),
                uptime: 100,
              };
            });
          const validators = sessionAuthorities.length;
          return {
            isFailed: false,
            isLoading: false,
            val: {
              height: publicKey.block?.number,
              compressed: publicKey.compressed!,
              uncompressed: publicKey.uncompressed!,
              id: publicKey.id,
              session: session.id,
              end: new Date(publicKey.block!.timestamp),
              start: new Date(publicKey.block!.timestamp),
              history,
              numberOfValidators: validators,
              isCurrent: true,
              authorities,
              keyGenThreshold: String((session.keyGenThreshold as Threshold).current),
              signatureThreshold: String((session.signatureThreshold as Threshold).current),
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
      .subscribe(setKey);
    return () => subscription.unsubscribe();
  }, [query]);
  return key;
}
