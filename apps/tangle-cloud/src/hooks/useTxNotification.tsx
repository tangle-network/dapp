import { TxName } from '../constants';
import useSharedTxNotification from '@tangle-network/tangle-shared-ui/hooks/useTxNotification';

const SUCCESS_MESSAGES: Record<TxName, string> = {
  [TxName.REJECT_SERVICE_REQUEST]: 'Service request rejected',
  [TxName.APPROVE_SERVICE_REQUEST]: 'Service request approved',
};

const useTxNotification = () => {
  const { notifyProcessing, notifySuccess, notifyError } = useSharedTxNotification<TxName>(SUCCESS_MESSAGES);

  return { notifyProcessing, notifySuccess, notifyError };
};

export default useTxNotification;
