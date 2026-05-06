import { NetworkId } from '@tangle-network/ui-components/constants/networks';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';
import { Hex } from 'viem';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BaseTxName } from '../types';

type HistoryTxStatus = 'pending' | 'inblock' | 'finalized' | 'failed';

export type HistoryTxDetail =
  | string
  | number
  | EvmAddress
  | SubstrateAddress
  | bigint;

export type HistoryTx<TxName extends BaseTxName = BaseTxName> = {
  name: TxName;
  hash: Hex;
  origin: SubstrateAddress | EvmAddress;
  network: NetworkId;
  timestamp: number;
  status: HistoryTxStatus;
  details?: Map<string, HistoryTxDetail>;
  errorMessage?: string;
};

type SerializedHistoryTx = Omit<HistoryTx, 'details'> & {
  details?: Record<string, SerializedHistoryTxDetail>;
};

type SerializedHistoryTxDetail =
  | string
  | number
  | { type: 'bigint'; value: string }
  | { type: 'BN'; value: string };

const serializeTx = (tx: HistoryTx): SerializedHistoryTx => {
  const serialized: SerializedHistoryTx = {
    name: tx.name,
    hash: tx.hash,
    origin: tx.origin,
    network: tx.network,
    timestamp: tx.timestamp,
    status: tx.status,
    errorMessage: tx.errorMessage,
  };

  if (tx.details !== undefined) {
    serialized.details = {};
    for (const [key, value] of tx.details.entries()) {
      if (typeof value === 'bigint') {
        serialized.details[key] = { type: 'bigint', value: value.toString() };
      } else {
        serialized.details[key] = value as string | number;
      }
    }
  }

  return serialized;
};

const deserializeTx = (serialized: SerializedHistoryTx): HistoryTx => {
  const tx: HistoryTx = {
    name: serialized.name,
    hash: serialized.hash,
    origin: serialized.origin,
    network: serialized.network,
    timestamp: serialized.timestamp,
    status: serialized.status,
    errorMessage: serialized.errorMessage,
  };

  if (serialized.details !== undefined) {
    tx.details = new Map<string, HistoryTxDetail>();
    for (const [key, value] of Object.entries(serialized.details)) {
      if (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        (value.type === 'bigint' || value.type === 'BN')
      ) {
        tx.details.set(key, BigInt(value.value));
      } else {
        tx.details.set(key, value as string | number);
      }
    }
  }

  return tx;
};

type StoreState = {
  transactions: HistoryTx[];
  pushTx: (transaction: HistoryTx) => void;
  patchTx: (hash: Hex, patch: Omit<Partial<HistoryTx>, 'hash'>) => void;
};

type PersistedState = {
  state: { transactions: HistoryTx[] };
  version?: number;
};

type SerializedPersistedState = {
  state: { transactions: SerializedHistoryTx[] };
  version?: number;
};

const useTxHistoryStore = create<StoreState>()(
  persist(
    (set) => ({
      transactions: [],
      pushTx: (transaction: HistoryTx) =>
        set((state) => ({
          transactions: [...state.transactions, transaction],
        })),
      patchTx: (hash: Hex, patch: Omit<Partial<HistoryTx>, 'hash'>) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.hash === hash ? { ...tx, ...patch } : tx,
          ),
        })),
    }),
    {
      name: 'tx-history',
      storage: {
        getItem: (name): PersistedState | null => {
          const str = localStorage.getItem(name);
          if (str === null) {
            return null;
          }
          try {
            const parsed: SerializedPersistedState = JSON.parse(str);
            if (parsed?.state?.transactions) {
              return {
                ...parsed,
                state: {
                  transactions: parsed.state.transactions.map(deserializeTx),
                },
              };
            }
            return parsed as unknown as PersistedState;
          } catch {
            return null;
          }
        },
        setItem: (name, value: PersistedState) => {
          const toStore: SerializedPersistedState = {
            ...value,
            state: {
              transactions: value.state.transactions.map(serializeTx),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);

export default useTxHistoryStore;
