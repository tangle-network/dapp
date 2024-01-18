import { useContext } from 'react';

import { ChooseWalletTypeContext } from '../provider/ChooseWalletTypeProvider';

const useChooseWalletModal = () => {
  const { isSelectWalletTypeModalOpen, setIsSelectWalletTypeModalOpen } =
    useContext(ChooseWalletTypeContext);

  return { isSelectWalletTypeModalOpen, setIsSelectWalletTypeModalOpen };
};

export default useChooseWalletModal;
