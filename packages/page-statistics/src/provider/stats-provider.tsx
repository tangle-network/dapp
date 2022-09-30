import { useLastBlockQuery, useMetaDataQuery } from '@webb-dapp/page-statistics/generated/graphql';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Chain metadata
 * @param currentBlock - the current block number
 * @param lastProcessBlock - The block number where the data syncing is done
 * @param activeSession - the current active session
 * @param lastSession - the last created session
 *
 * */
export type Metadata = {
  currentBlock: string;
  lastProcessBlock: string;
  lastSession: string;
  activeSession: string;
};

/**
 *
 * Get the current session from metadata
 * */
export function session(height: string, sessionHeight: number) {
  const blockNumber = Number(height);
  const sessionNumber = Math.floor(blockNumber / sessionHeight);
  return sessionNumber.toString();
}

/**
 *
 * Get the next session from metadata
 * */
export function nextSession(height: string, sessionHeight: number): string {
  const blockNumber = Number(height);
  const sessionNumber = Math.ceil(blockNumber / sessionHeight);
  return sessionNumber.toString();
}

type StatsProvidervalue = {
  // Number of seconds for a block to be generated
  blockTime: number;
  // Number of blocks for a session
  sessionHeight: number;
  //SubQuery synced time object
  time: SubQlTime;
  // update time
  updateTime(time: SubQlTime): void;
  metaData: Metadata;
  isReady: boolean;
};
export type ISubQlTime = {
  current: Date;
};
/**
 * Wrapper date object that consumes the SubQuery node blocks fetching as a time source
 * */
class SubQlTime {
  private lastSynced: Date;

  constructor(private lastBlockTime: Date) {
    this.lastSynced = new Date();
  }

  /**
   * Sync the inner date object
   * */
  sync(date: Date): SubQlTime {
    return new SubQlTime(date);
  }

  get current(): Date {
    // Calculate the different from the sync point
    const diff = new Date().getTime() - this.lastSynced.getTime();
    // add the diff to the block timestamp
    return new Date(this.lastBlockTime.getTime() + diff);
  }

  syncFromIsString(dateStr: string) {
    const date = new Date(dateStr);
    return this.sync(date);
  }
}

const statsContext: React.Context<StatsProvidervalue> = React.createContext<StatsProvidervalue>({
  blockTime: 6,
  sessionHeight: 10,
  time: new SubQlTime(new Date()),
  updateTime(_time: SubQlTime): void {},
  metaData: {
    activeSession: '0',
    currentBlock: '0',
    lastSession: '0',
    lastProcessBlock: '0',
  },
  isReady: false,
});
export function useStatsContext() {
  return useContext(statsContext);
}
export const useSubQLtime = (): SubQlTime => {
  const ctx = useContext(statsContext);

  return ctx.time;
};

export const useStaticConfig = () => {
  const { blockTime, sessionHeight } = useStatsContext();
  return useMemo(() => {
    return {
      blockTime,
      sessionHeight,
    };
  }, [blockTime, sessionHeight]);
};
export const useActiveSession = () => {
  const {
    metaData: { activeSession },
  } = useStatsContext();
  return activeSession;
};
export const StatsProvider: React.FC<Omit<StatsProvidervalue, 'isReady' | 'metaData' | 'updateTime' | 'time'>> = (
  props
) => {
  const [time, setTime] = useState<SubQlTime>(new SubQlTime(new Date()));
  const [metaData, setMetaData] = useState<Metadata>({
    activeSession: '0',
    currentBlock: '',
    lastProcessBlock: '',
    lastSession: '',
  });
  const [staticConfig] = useState<{
    blockTime: number;
    sessionHeight: number;
  }>({
    sessionHeight: props.sessionHeight,
    blockTime: props.blockTime,
  });
  const [isReady, setIsReady] = useState(false);
  const value = useMemo<StatsProvidervalue>(() => {
    return {
      time,
      ...staticConfig,
      updateTime: (time: SubQlTime) => {
        setTime(time);
      },
      isReady,
      metaData,
    };
  }, [staticConfig, metaData, isReady, time]);
  const query = useLastBlockQuery();

  useEffect(() => {
    const subscription = query.observable
      .map((res): SubQlTime | null => {
        if (res.data?.blocks) {
          const lastBlock = res.data.blocks.nodes[0];
          if (!lastBlock || !lastBlock.timestamp) {
            return null;
          }
          const lastBlockTimestamp = lastBlock.timestamp;
          return new SubQlTime(new Date(lastBlockTimestamp));
        }
        return null;
      })
      .subscribe((val) => {
        if (val) {
          setTime(val);
        }
      });
    return () => subscription.unsubscribe();
  }, [query]);
  const metaDataQuery = useMetaDataQuery({
    fetchPolicy: 'cache-and-network',
  });
  useEffect(() => {
    const unSub = metaDataQuery.observable
      .map((r): Metadata | null => {
        if (r.data?._metadata) {
          const data = r.data._metadata;
          return {
            currentBlock: String(data.targetHeight),
            lastProcessBlock: String(data.lastProcessedHeight),
            activeSession: session(String(data.lastProcessedHeight), staticConfig.sessionHeight),
            lastSession: nextSession(String(data.targetHeight), staticConfig.sessionHeight),
          };
        }
        return null;
      })
      .subscribe((val) => {
        if (val) {
          setIsReady(true);
          setMetaData(val);
        }
      });
    return () => unSub.unsubscribe();
  }, [query, metaDataQuery, isReady, staticConfig]);

  useEffect(() => {
    query.startPolling(staticConfig.blockTime * 1000);
    metaDataQuery.startPolling(staticConfig.blockTime * 1000);

    return () => {
      query.stopPolling();
      metaDataQuery.stopPolling();
    };
  }, [query, metaDataQuery, staticConfig]);

  return <statsContext.Provider value={value}>{props.children}</statsContext.Provider>;
};
