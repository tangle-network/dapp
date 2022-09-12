import {
  usePublicKeyLazyQuery,
  usePublicKeysLazyQuery,
  useSessionKeysLazyQuery,
} from '@webb-dapp/page-statistics/generated/graphql';
import { useCurrentMetaData } from '@webb-dapp/page-statistics/provider/hooks/useCurrentMetaData';
import { useEffect, useState } from 'react';

import { DKGAuthority, Loadable, Page, PageInfoQuery, SessionKeyHistory, SessionKeyStatus, Threshold } from './types';

type PublicKeyContent = {
  id: string;

  uncompressed: string;
  compressed: string;

  start: Date;
  end: Date;
  session: string;
};

export interface PublicKey extends PublicKeyContent {
  isCurrent: boolean;
  keyGenAuthorities: string[];
}

export interface PublicKeyListView extends PublicKeyContent {
  height: string;
  keyGenAuthorities: string[];
  keyGenThreshold: string;
  signatureThreshold: string;
  session: string;
}

type PublicKeyHistoryEntry = {
  at: Date;
  hash: string;
  status: SessionKeyStatus;
};
type KeyGenAuthority = {
  id: string;
  account: string;
  location: string;
  uptime: number;
  reputation: number;
};
interface PublicKeyDetails extends PublicKeyContent {
  isCurrent: boolean;
  history: PublicKeyHistoryEntry[];
  keyGenThreshold: string;
  signatureThreshold: string;
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
          return {
            isLoading: false,
            isFailed: false,
            val: {
              items: data.nodes
                .filter((n) => n)
                .map((node) => {
                  const session = node!.sessions?.nodes[0]!;
                  const authorities = session.bestAuthorities.map((auth: any) => auth.accountId);
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
              const publicKey = i!.publicKey!;
              return {
                id: publicKey.id,
                end: new Date(publicKey.block!.timestamp),
                start: new Date(publicKey.block!.timestamp),
                compressed: publicKey.compressed!,
                uncompressed: publicKey.uncompressed!,
                keyGenAuthorities: i!.bestAuthorities.map((auth: any) => auth.accountId),
                session: i!.id,
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
              // TODO fix date
              at: new Date(Date.now()),
              status: val.stage,
              hash: val.txHash,
            };
          });
          const authorities = session.bestAuthorities.map((auth: DKGAuthority): KeyGenAuthority => {
            return {
              account: auth.accountId,
              id: auth.authorityId,
              location: 'any',
              reputation: Number(auth.reputation),
              uptime: 100,
            };
          });
          return {
            isFailed: false,
            isLoading: false,
            val: {
              compressed: publicKey.compressed!,
              uncompressed: publicKey.uncompressed!,
              id: publicKey.id,
              session: session.id,
              end: new Date(publicKey.block!.timestamp),
              start: new Date(publicKey.block!.timestamp),
              history,
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
