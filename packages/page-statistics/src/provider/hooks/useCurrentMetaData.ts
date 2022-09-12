import { MetaDataQuery, useMetaDataQuery } from '@webb-dapp/page-statistics/generated/graphql';
import { Loadable } from '@webb-dapp/page-statistics/provider/hooks/types';
import { useEffect, useState } from 'react';

type Metadata = MetaDataQuery['_metadata'];

export function useCurrentMetaData(): Loadable<Metadata> {
  const query = useMetaDataQuery();
  const [metaData, setMetaData] = useState<Loadable<Metadata>>({
    isLoading: true,
    isFailed: false,
    val: null,
  });
  useEffect(() => {
    const unSub = query.observable
      .map((r): Loadable<Metadata> => {
        if (r.loading) {
          return {
            isLoading: true,
            isFailed: false,
            val: null,
          };
        }
        if (r.error) {
          return {
            isLoading: false,
            isFailed: true,
            error: r.error.message,
            val: null,
          };
        }
        return {
          isLoading: false,
          isFailed: false,
          val: r.data?._metadata || null,
        };
      })
      .subscribe(setMetaData);
    return () => unSub.unsubscribe();
  }, [query]);
  return metaData;
}
