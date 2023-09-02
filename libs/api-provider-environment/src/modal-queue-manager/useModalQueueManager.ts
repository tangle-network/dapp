import { useContext } from 'react';
import ModalQueueManagerContext from './context';

const useModalQueueManager = () => {
  const ctx = useContext(ModalQueueManagerContext);
  if (!ctx) {
    throw new Error(
      'useModalQueueManager must be used within a ModalQueueManagerProvider'
    );
  }
  return ctx;
};

export default useModalQueueManager;
