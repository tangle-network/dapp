import { useWebContext } from '@webb-tools/api-provider-environment';
import { TransactionQueueApi } from '@webb-tools/api-provider-environment/transaction';

export function useTxQueue(): TransactionQueueApi {
  const { txQueue } = useWebContext();
  return txQueue;
}
