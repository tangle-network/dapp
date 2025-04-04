import { BN } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import { NetworkId } from '@tangle-network/ui-components/constants/networks';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';
import { create } from 'zustand';
import { BaseTxName } from '../types';

type HistoryTxStatus = 'pending' | 'inblock' | 'finalized' | 'failed';

export type HistoryTxDetail =
  | string
  | number
  | EvmAddress
  | SubstrateAddress
  | BN;

export type HistoryTx<TxName extends BaseTxName = BaseTxName> = {
  name: TxName;
  hash: HexString;
  origin: SubstrateAddress | EvmAddress;
  network: NetworkId;
  timestamp: number;
  status: HistoryTxStatus;
  details?: Map<string, HistoryTxDetail>;
  errorMessage?: string;
};

const useTxHistoryStore = create<{
  transactions: HistoryTx[];
  pushTx: (transaction: HistoryTx) => void;
  patchTx: (hash: HexString, patch: Omit<Partial<HistoryTx>, 'hash'>) => void;
}>((set) => ({
  transactions: [],
  pushTx: (transaction: HistoryTx) =>
    set((state) => ({ transactions: [...state.transactions, transaction] })),
  patchTx: (hash: HexString, patch: Omit<Partial<HistoryTx>, 'hash'>) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, ...patch } : tx,
      ),
    })),
}));

export default useTxHistoryStore;
