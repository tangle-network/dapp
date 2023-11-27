import type { TransactionType } from '@webb-tools/abstract-api-provider';

export interface TxTableContainerProps {
  data: TransactionType[];
  pageSize: number;
  hideRecipientCol?: boolean;
  className?: string;
  allowSorting?: boolean;
}
