import { useCallback, useMemo } from 'react';
import { useObservableState } from 'observable-hooks';
import { useWebContext } from '@webb-tools/api-provider-environment';

import subjects from './subjects.js';

export type UseReceiveModalReturnType = {
  /**
   * Boolean to check if the receive modal is open
   */
  isModalOpen: boolean;

  /**
   * Toggle or set state of the wallet modal
   */
  toggleModal: (isOpen?: boolean) => void;

  /**
   * Public key of current account
   */
  publicKey?: string;
};

const useReceiveModal = (): UseReceiveModalReturnType => {
  const isModalOpen = useObservableState(subjects.isReceiveModalOpenSubject);

  const { noteManager } = useWebContext();

  /**
   * Toggle or set state of the wallet modal
   */
  const toggleModal = useCallback((isOpenArg?: boolean) => {
    const isOpen = isOpenArg ?? !subjects.isReceiveModalOpenSubject.getValue();

    subjects.setReceiveModalOpen(isOpen);
  }, []);

  const publicKey = useMemo(
    () => noteManager?.getKeypair().toString(),
    [noteManager]
  );

  return {
    isModalOpen,
    toggleModal,
    publicKey,
  };
};

export default useReceiveModal;
