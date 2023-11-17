import { useLiveQuery } from 'dexie-react-hooks';
import type { TransactionType } from '@webb-tools/abstract-api-provider';
import transactionDB from './client-storage/db';

export type UseTxClientStorageReturnType = {
  transactions: TransactionType[];
  addNewTransaction: (tx: TransactionType) => void;
  clearTxHistory: () => void;
};

const useTxClientStorage = () => {
  const transactions = useLiveQuery(() => transactionDB.txItems.toArray());

  const addNewTransaction = (tx: TransactionType) => {
    transactionDB.txItems.add({ ...tx });
  };

  const clearTxHistory = () => {
    transactionDB.transaction('rw', transactionDB.txItems, async () => {
      await Promise.all(transactionDB.tables.map((table) => table.clear()));
    });
  };

  const getTxDetailByHash = async (hash: string) => {
    return await transactionDB.txItems.get({ hash });
  };

  return {
    transactions: transactions ?? [],
    addNewTransaction,
    clearTxHistory,
    getTxDetailByHash,
  };
};

export default useTxClientStorage;
