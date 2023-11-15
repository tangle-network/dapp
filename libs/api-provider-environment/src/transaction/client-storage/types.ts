import { TransactionType } from '@webb-tools/abstract-api-provider';

export interface TxItem extends TransactionType {
  id?: number;
}
