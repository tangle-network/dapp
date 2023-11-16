import Dexie, { Table } from 'dexie';
import type { TxItem } from './types';

let hasInstance = false;

export class TransactionDB extends Dexie {
  txItems!: Table<TxItem, number>;
  constructor() {
    // Check to make sure the class hasn't already been instantiated.
    if (hasInstance) {
      throw new Error('Can only create one instance on TransactionDB!');
    }
    super('TransactionDB');
    this.version(1).stores({
      txItems: '++id',
    });
    hasInstance = true;
  }
}

const transactionDB = new TransactionDB();

export default transactionDB;
