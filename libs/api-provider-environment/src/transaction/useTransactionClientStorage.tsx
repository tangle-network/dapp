import { useLiveQuery } from 'dexie-react-hooks';
import { TransactionType } from '@webb-tools/abstract-api-provider';
import transactionDB from './client-storage/db';

export type UseTxClientStorageReturnType = {
  transactions: TransactionType[];
  addNewTransaction: (tx: TransactionType) => void;
  clearTransactions: () => void;
};

const useTxClientStorage = () => {
  const transactions = useLiveQuery(() => transactionDB.txItems.toArray());

  const addNewTransaction = (tx: TransactionType) => {
    transactionDB.txItems.add({ ...tx });
  };

  const clearTransactions = () => {
    transactionDB.transaction('rw', transactionDB.txItems, async () => {
      await Promise.all(transactionDB.tables.map((table) => table.clear()));
    });
  };

  return {
    transactions: transactions ?? [],
    addNewTransaction,
    clearTransactions,
  };
};

export default useTxClientStorage;
