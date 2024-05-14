import { useLiveQuery } from 'dexie-react-hooks';
import type { TransactionType } from '@webb-tools/abstract-api-provider/index.js';
import transactionDB from './client-storage/db.js';

export type UseTxClientStorageReturnType = {
  transactions: TransactionType[];
  addNewTransaction: (tx: TransactionType) => void;
  addTransactions: (txs: TransactionType[]) => void;
  clearTxHistory: () => void;
};

const useTxClientStorage = () => {
  const transactions = useLiveQuery(() => transactionDB.txItems.toArray());

  const addNewTransaction = async (tx: TransactionType) => {
    await transactionDB.txItems.add({ ...tx });
  };

  const addTransactions = async (txs: TransactionType[]) => {
    await transactionDB.txItems.bulkAdd(txs);
  };

  const clearTxHistory = async () => {
    await transactionDB.transaction('rw', transactionDB.txItems, async () => {
      await Promise.all(transactionDB.tables.map((table) => table.clear()));
    });
  };

  const getTxDetailByHash = async (hash: string) => {
    return await transactionDB.txItems.get({ hash });
  };

  return {
    transactions: transactions ?? [],
    addNewTransaction,
    addTransactions,
    clearTxHistory,
    getTxDetailByHash,
  };
};

export default useTxClientStorage;
