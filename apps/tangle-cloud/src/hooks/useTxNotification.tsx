import { TxName } from '../constants';
import useSharedTxNotification from '@tangle-network/tangle-shared-ui/hooks/useTxNotification';

export const SUCCESS_MESSAGES: Record<TxName, string> = {
  [TxName.PRE_REGISTER_BLUEPRINT]: 'Operator intent signaled',
  [TxName.REGISTER_BLUEPRINT]: 'Registered as operator successfully',
  [TxName.UNREGISTER_BLUEPRINT]: 'Unregistered from blueprint successfully',
  [TxName.REJECT_SERVICE_REQUEST]: 'Service request rejected',
  [TxName.APPROVE_SERVICE_REQUEST]: 'Service request approved',
  [TxName.DEPLOY_BLUEPRINT]: 'Blueprint deployed successfully',
  [TxName.TERMINATE_SERVICE_INSTANCE]: 'Service instance terminated',
  [TxName.CLAIM_EARNINGS]: 'Earnings claimed successfully',
};

const useTxNotification = () => {
  const { notifyProcessing, notifySuccess, notifyError } =
    useSharedTxNotification<TxName>(SUCCESS_MESSAGES);

  return { notifyProcessing, notifySuccess, notifyError };
};

export default useTxNotification;
