import Dexie, { Table } from 'dexie';
import type { TransactionType } from '@webb-tools/abstract-api-provider';

let hasInstance = false;

export class TransactionDB extends Dexie {
  txItems!: Table<TransactionType, number>;
  constructor() {
    // Check to make sure the class hasn't already been instantiated.
    if (hasInstance) {
      throw new Error('Can only create one instance on TransactionDB!');
    }
    super('TransactionDB');
    this.version(1).stores({
      txItems: 'hash',
    });
    hasInstance = true;
  }
}

const transactionDB = new TransactionDB();

export default transactionDB;
