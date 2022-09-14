import { useMetaDataQuery } from '@webb-dapp/page-statistics/generated/graphql';
import { Loadable } from '@webb-dapp/page-statistics/provider/hooks/types';
import { useEffect, useState } from 'react';

/**
 * Chain metadata
 * @param currentBlock - the current block number
 * @param lastProcessBlock - The block number where the data syncing is done
 * @param activeSession - the current active session
 * @param lastSession - the last created session
 *
 * */
type Metadata = {
  currentBlock: string;
  lastProcessBlock: string;
  lastSession: string;
  activeSession: string;
};
/**
 *
 * Get the current session from metadata
 * */
export function session(height: string) {
  const blockNumber = Number(height);
  const sessionNumber = Math.floor(blockNumber / 10) * 10;

  return String(sessionNumber - 10);
}

/**
 *
 * Get the next session from metadata
 * */
export function nextSession(height: string): string {
  const blockNumber = Number(height);
  const sessionNumber = Math.floor(blockNumber / 10) * 10;

  return String(sessionNumber);
}

export function useCurrentMetaData(): Loadable<Metadata> {
  const query = useMetaDataQuery({
    fetchPolicy: 'cache-and-network',
  });
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
        if (r.data?._metadata) {
          const data = r.data._metadata;
          return {
            isLoading: false,
            isFailed: false,
            val: {
              currentBlock: String(data.lastProcessedHeight),
              lastProcessBlock: String(data.targetHeight),
              activeSession: session(String(data.targetHeight)),
              lastSession: nextSession(String(data.targetHeight)),
            },
          };
        }
        return {
          isLoading: false,
          isFailed: false,
          val: null,
        };
      })
      .subscribe(setMetaData);
    return () => unSub.unsubscribe();
  }, [query]);
  return metaData;
}
