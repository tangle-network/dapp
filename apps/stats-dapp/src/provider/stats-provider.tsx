import '@webb-tools/dkg-substrate-types';
import { useLastBlockQuery, useMetaDataQuery } from '../generated/graphql';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { sessionFrame } from './hooks';

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
  activeSessionBlock: number;
};

/**
 *
 * Get the current session from metadata
 * */
export function session(height: string, sessionHeight: number) {
  const blockNumber = Number(height);
  const currentSessionNumber = Math.floor(blockNumber / sessionHeight);
  return currentSessionNumber.toString();
}

/**
 *
 * Get the next session from metadata
 * */
export function nextSession(height: string, sessionHeight: number): string {
  const blockNumber = Number(height);
  const currentSessionNumber = Math.ceil(blockNumber / sessionHeight);
  return currentSessionNumber.toString();
}

type StatsProvidervalue = {
  children?: React.ReactNode;
  // Number of seconds for a block to be generated
  blockTime: number;
  // Number of blocks for a session * 12 seconds
  sessionHeight: number;
  //SubQuery synced time object
  time: SubQlTime;
  // update time
  updateTime(time: SubQlTime): void;
  metaData: Metadata;
  isReady: boolean;
  // polkadot api
  api?: ApiPromise;
  // is dark mode
  isDarkMode?: boolean;
  // subquery endpoint
  subqueryEndpoint: string;
  // polkadot endpoint
  polkadotEndpoint: string;
  // dkg keys data from polkadot api
  dkgDataFromPolkadotAPI: {
    currentSessionNumber: number;
    currentSessionTimeFrame: {
      start: Date;
      end: Date;
    };
    currentKey: string;
    currentAuthorities: string[];
    nextAuthorities: string[];
    nextSessionNumber: number;
    nextKey: string;
    proposerCount: number;
    proposerThreshold: number;
    keygenThreshold: number;
    signatureThreshold: number;
  };
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

const statsContext: React.Context<StatsProvidervalue> =
  React.createContext<StatsProvidervalue>({
    blockTime: 0,
    sessionHeight: 0,
    time: new SubQlTime(new Date()),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    updateTime(_time: SubQlTime): void {},
    metaData: {
      activeSession: '0',
      currentBlock: '0',
      lastSession: '0',
      lastProcessBlock: '0',
      activeSessionBlock: 0,
    },
    isReady: false,
    subqueryEndpoint: '',
    polkadotEndpoint: '',
    dkgDataFromPolkadotAPI: {
      currentSessionNumber: 0,
      currentSessionTimeFrame: {
        start: new Date(),
        end: new Date(),
      },
      currentKey: '',
      currentAuthorities: [],
      nextAuthorities: [],
      nextSessionNumber: 0,
      nextKey: '',
      proposerCount: 0,
      proposerThreshold: 0,
      keygenThreshold: 0,
      signatureThreshold: 0,
    },
  });

export function useStatsContext() {
  return useContext(statsContext);
}

export const useSubQLtime = (): SubQlTime => {
  const ctx = useContext(statsContext);

  return ctx.time;
};

export const useStaticConfig = () => {
  const { sessionHeight } = useStatsContext();
  return useMemo(() => {
    return {
      sessionHeight,
    };
  }, [sessionHeight]);
};

export const useActiveSession = () => {
  const {
    dkgDataFromPolkadotAPI: { currentSessionNumber },
  } = useStatsContext();
  return String(currentSessionNumber);
};

export const StatsProvider: React.FC<
  Omit<
    StatsProvidervalue,
    | 'blockTime'
    | 'isReady'
    | 'metaData'
    | 'updateTime'
    | 'time'
    | 'api'
    | 'sessionHeight'
  >
> = (props) => {
  const [blockTime, setBlockTime] = useState(0);
  const [time, setTime] = useState<SubQlTime>(new SubQlTime(new Date()));
  const [metaData, setMetaData] = useState<Metadata>({
    activeSession: '0',
    currentBlock: '',
    lastProcessBlock: '',
    lastSession: '',
    activeSessionBlock: 0,
  });
  const [isReady, setIsReady] = useState(false);
  const [api, setApi] = useState<ApiPromise | undefined>();
  const [sessionHeight, setSessionHeight] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dkgDataFromPolkadotAPI, setDkgDataFromPolkadotAPI] = useState({
    currentSessionNumber: 0,
    currentSessionTimeFrame: {
      start: new Date(),
      end: new Date(),
    },
    currentKey: '',
    currentAuthorities: [] as string[],
    nextAuthorities: [] as string[],
    nextSessionNumber: 0,
    nextKey: '',
    proposerCount: 0,
    proposerThreshold: 0,
    keygenThreshold: 0,
    signatureThreshold: 0,
  });

  useEffect(() => {
    function getCurrentTheme() {
      if (localStorage.getItem('theme') === 'dark') {
        setIsDarkMode(true);
      } else if (localStorage.getItem('theme') === 'light') {
        setIsDarkMode(false);
      }
    }

    getCurrentTheme();

    window.addEventListener('storage', getCurrentTheme);

    return () => window.removeEventListener('storage', getCurrentTheme);
  }, []);

  const value = useMemo<StatsProvidervalue>(() => {
    return {
      blockTime,
      time,
      sessionHeight,
      updateTime: (time: SubQlTime) => {
        setTime(time);
      },
      isReady,
      metaData,
      api,
      isDarkMode,
      subqueryEndpoint: props.subqueryEndpoint,
      polkadotEndpoint: props.polkadotEndpoint,
      dkgDataFromPolkadotAPI,
    };
  }, [
    sessionHeight,
    metaData,
    isReady,
    time,
    api,
    isDarkMode,
    props,
    blockTime,
    dkgDataFromPolkadotAPI,
  ]);

  const query = useLastBlockQuery({
    pollInterval: 10000,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const getPromiseApi = async (): Promise<void> => {
      const wsProvider = new WsProvider(props.polkadotEndpoint);
      const apiPromise = await ApiPromise.create({ provider: wsProvider });
      setApi(apiPromise);

      // Get session height from Polkadot API
      const blockTime =
        (Number(await apiPromise.consts.timestamp.minimumPeriod) * 2) / 1000;
      setBlockTime(blockTime);
      const sessionPeriod = await apiPromise.consts.dkg.sessionPeriod;
      const sessionHeight = Number(sessionPeriod.toString()) * blockTime;
      setSessionHeight(sessionHeight);

      // Get DKG data from Polkadot API
      const currentDKGPublicKey = await apiPromise.query.dkg.dkgPublicKey();
      const currentSessionNumber = currentDKGPublicKey[0].toNumber();
      const currentKey = currentDKGPublicKey[1].toString();
      const nextDKGPublicKey = (
        await apiPromise.query.dkg.nextDKGPublicKey()
      ).unwrapOr(null);

      let nextSessionNumber = 0;
      let nextKey = '';
      if (!nextDKGPublicKey) {
        nextSessionNumber = currentSessionNumber + 1;
        nextKey = '';
      } else {
        nextSessionNumber = nextDKGPublicKey[0].toNumber();
        nextKey = nextDKGPublicKey[1].toString();
      }
      const proposerCount = await apiPromise.query.dkgProposals.proposerCount();
      const proposerThreshold =
        await apiPromise.query.dkgProposals.proposerThreshold();
      const lastSessionRotationBlockNumber =
        await apiPromise.query.dkg.lastSessionRotationBlock();
      const lastSessionRotaionBlockHash =
        await apiPromise.rpc.chain.getBlockHash(
          lastSessionRotationBlockNumber.toString()
        );
      const lastSessionRotationBlock = await apiPromise.rpc.chain.getBlock(
        lastSessionRotaionBlockHash
      );
      const lastSessionRotationBlockTimestamp =
        lastSessionRotationBlock.block.extrinsics[0].method.args[0].toJSON();
      const [start, end] = sessionFrame(
        new Date(lastSessionRotationBlockTimestamp as string).toString(),
        sessionHeight
      );
      const currentAuthoritySet = await apiPromise.query.dkg.authorities();
      const currentAuthorities = currentAuthoritySet.toJSON();
      const keygenThreshold = await apiPromise.query.dkg.keygenThreshold();
      const signatureThreshold =
        await apiPromise.query.dkg.signatureThreshold();
      const nextAuthoritiesSet = await apiPromise.query.dkg.nextAuthorities();
      const nextAuthorities = nextAuthoritiesSet.toJSON();

      setDkgDataFromPolkadotAPI({
        currentSessionNumber,
        currentSessionTimeFrame: {
          start: start ?? new Date(),
          end: end ?? new Date(),
        },
        currentKey,
        currentAuthorities: currentAuthorities as string[],
        nextAuthorities: nextAuthorities as string[],
        nextSessionNumber,
        nextKey,
        proposerCount: Number(proposerCount.toString()),
        proposerThreshold: Number(proposerThreshold.toString()),
        keygenThreshold: Number(keygenThreshold.toString()),
        signatureThreshold: Number(signatureThreshold.toString()),
      });
    };

    getPromiseApi();

    const intervalId = setInterval(getPromiseApi, 10000);
    return () => clearInterval(intervalId);
  }, [props.polkadotEndpoint]);

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
    pollInterval: 10000,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const unSub = metaDataQuery.observable
      .map((r): Metadata | null => {
        if (r.data?._metadata) {
          const data = r.data._metadata;
          const lastSession = r.data.sessions?.nodes[0];

          if (!lastSession) {
            return null;
          }

          const currentSessionIsCorrect =
            Number(lastSession.id) ===
            dkgDataFromPolkadotAPI.currentSessionNumber;

          return {
            currentBlock: String(data.targetHeight),
            lastProcessBlock: String(data.lastProcessedHeight),
            activeSession: currentSessionIsCorrect
              ? lastSession.id
              : String(dkgDataFromPolkadotAPI.currentSessionNumber),
            lastSession: lastSession.id,
            activeSessionBlock: lastSession.blockNumber,
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
  }, [query, metaDataQuery, isReady, sessionHeight, dkgDataFromPolkadotAPI]);

  return (
    <statsContext.Provider value={value}>
      {props.children}
    </statsContext.Provider>
  );
};
