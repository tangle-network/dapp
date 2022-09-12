import { usePublicKeysQuery } from '@webb-dapp/page-statistics/generated/graphql';
import { useEffect, useState } from 'react';

import { Loadable, Page } from './types';

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
  status: 'Generated' | 'Signed' | 'Rotated';
};

interface PublicKeyDetails extends PublicKeyContent {
  isCurrent: string;
  history: PublicKeyHistoryEntry[];
}

export function useKeys(): Loadable<Page<PublicKeyListView>> {
  const query = usePublicKeysQuery({
    variables: {
      offset: 0,
      PerPage: 30,
    },
  });
  const [page, setPage] = useState<Loadable<Page<PublicKeyListView>>>({
    val: null,
    isFailed: false,
    isLoading: true,
  });
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
                    end: new Date(node!.block?.timestamp),
                    start: new Date(node!.block?.timestamp),
                    compressed: node!.compressed!,
                    uncompressed: node!.compressed!,
                    id: node!.id,
                    height: String(node!.block?.number),
                    keyGenAuthorities: authorities,
                    session: session.id,
                    keyGenThreshold: String(session.keyGenThreshold.current),
                    signatureThreshold: String(session.signatureThreshold.current),
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

export function useActiveKeys(): Loadable<[PublicKey, PublicKey]> {}

export function useKey(id: string): Loadable<PublicKeyDetails> {}
