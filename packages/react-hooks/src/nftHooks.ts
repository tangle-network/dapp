import { useEffect, useMemo, useState } from 'react';
import { Option } from '@polkadot/types';
import { TokenInfoOf, ClassInfoOf } from '@webb-tools/types/interfaces';
import { mergeMap, map } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';

import { useAccounts } from './useAccounts';
import { useApi } from './useApi';

export const useAllNFTTokens = (): { data: [ClassInfoOf, TokenInfoOf][]; loading: boolean } => {
  const { api } = useApi();
  const { active } = useAccounts();
  const [result, setResult] = useState<[ClassInfoOf, TokenInfoOf][]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!api || !active) return;

    setLoading(true);
    const unsub = api.query.ormlNft.tokensByOwner.entries(active.address).pipe(
      map((result: any) => result.map((item: any) => {
        return {
          classes: item[0].args[1][0].toString(),
          tokenId: item[0].args[1][1].toString()
        };
      })),
      mergeMap((result: { classes: string; tokenId: string }[]) => {
        if (result.length === 0) return of([]);

        return combineLatest(result.map((item) => {
          return combineLatest([
            api.query.ormlNft.classes<Option<ClassInfoOf>>(item.classes),
            api.query.ormlNft.tokens<Option<TokenInfoOf>>(item.classes, item.tokenId)
          ]);
        })).pipe(
          map((result) => {
            return result.map((item) => [item[0].unwrapOrDefault(), item[1].unwrapOrDefault()]) as unknown as [ClassInfoOf, TokenInfoOf][];
          })
        );
      })
    ).subscribe({
      error: (e) => {
        console.log(e);

        setLoading(false);
        setResult([]);
      },
      next: (result) => {
        setLoading(false);
        setResult(result);
      }
    });

    return (): void => unsub?.unsubscribe();
  }, [api, active]);

  return useMemo(() => ({ data: result, loading }), [loading, result]);
};
