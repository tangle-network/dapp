import { TxName } from '../constants';
import useSharedTxNotification from '@tangle-network/tangle-shared-ui/hooks/useTxNotification';

export const SUCCESS_MESSAGES: Record<TxName, string> = {
  [TxName.REJECT_SERVICE_REQUEST]: 'Service request rejected',
  [TxName.APPROVE_SERVICE_REQUEST]: 'Service request approved',
  [TxName.REGISTER_BLUEPRINT]: 'Blueprint registered',
  [TxName.DEPLOY_BLUEPRINT]: 'Blueprint deployed',
  [TxName.TERMINATE_SERVICE_INSTANCE]: 'Service instance terminated',
};

const useTxNotification = () => {
  const { notifyProcessing, notifySuccess, notifyError } =
    useSharedTxNotification<TxName>(SUCCESS_MESSAGES);

  return { notifyProcessing, notifySuccess, notifyError };
};

export default useTxNotification;
