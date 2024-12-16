import { useContext } from 'react';
import BridgeTxQueueContext from './BridgeTxQueueContext';

const useBridgeTxQueue = () => {
  return useContext(BridgeTxQueueContext);
};

export default useBridgeTxQueue;
