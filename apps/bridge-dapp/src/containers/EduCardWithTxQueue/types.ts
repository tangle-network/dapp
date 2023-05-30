import { TransactionPayload } from '@webb-tools/webb-ui-components';
import { BridgeTabType } from '../../types';

export interface EduCardWithTxQueueProps {
  activeTab: BridgeTabType;
}

export interface TxQueueContainerProps {
  isDisplay: boolean;

  transactionPayloads: TransactionPayload[];
}
