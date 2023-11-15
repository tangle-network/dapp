import Dexie, { Table } from 'dexie';
import type { TxItem } from './types';

let instance: any;

export class TransactionDB extends Dexie {
  txItems!: Table<TxItem, number>;
  constructor() {
    // Check to make sure the class hasn't already been instantiated.
    if (instance) {
      throw new Error('Can only create one instance on TransactionDB!');
    }
    super('TransactionDB');
    this.version(1).stores({
      txItems: '++id',
    });
    instance = this;
  }
}

const transactionDB = new TransactionDB();

export default transactionDB;
