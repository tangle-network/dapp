import { useLastBlockQuery } from '@webb-dapp/page-statistics/generated/graphql';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

type StatsProvidervalue = {
  // Number of seconds for a block to be generated
  blockTime: number;
  // Number of blocks for a session
  sessionHeight: number;
  //SubQuery synced time object
  time: SubQlTime;
  // update time
  updateTime(time: SubQlTime): void;
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

const statsContext: React.Context<StatsProvidervalue> = React.createContext({
  blockTime: 6,
  sessionHeight: 10,
  time: new SubQlTime(new Date()),
  updateTime(_time: SubQlTime): void {},
});

export function useSubQLtime() {
  const ctx = useContext(statsContext);
  const updateTime = useCallback(
    (newTime: Date) => {
      const time = ctx.time.sync(newTime);
      ctx.updateTime(time);
    },
    [ctx]
  );
  return [ctx.time, updateTime];
}

export const StatsProvider: React.FC<Omit<StatsProvidervalue, 'updateTime' | 'time'>> = (props) => {
  const [time, setTime] = useState<SubQlTime>(new SubQlTime(new Date()));
  const [staticConfig] = useState<{
    blockTime: number;
    sessionHeight: number;
  }>({
    sessionHeight: props.sessionHeight,
    blockTime: props.blockTime,
  });
  const value = useMemo(() => {
    return {
      time,
      ...staticConfig,
      updateTime: (time: SubQlTime) => {
        setTime(time);
      },
    };
  }, [staticConfig, time]);
  const query = useLastBlockQuery();

  useEffect(() => {
    query.startPolling(staticConfig.blockTime * 1000);
    return () => query.stopPolling();
  }, [query, staticConfig]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): SubQlTime | null => {
        if (res.data.blocks) {
          const lastBlock = res.data.blocks.nodes[0]!;
          const lastBlockTimestamp = lastBlock.timestamp;
          return new SubQlTime(lastBlockTimestamp);
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

  return <statsContext.Provider value={value}>{props.children}</statsContext.Provider>;
};
