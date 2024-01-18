import {
  createContext,
  type FC,
  type PropsWithChildren,
  useState,
} from 'react';

interface ChooseWalletTypeContextProps {
  isSelectWalletTypeModalOpen: boolean;
  setIsSelectWalletTypeModalOpen: (isOpen: boolean) => void;
}

export const ChooseWalletTypeContext =
  createContext<ChooseWalletTypeContextProps>(
    {} as ChooseWalletTypeContextProps
  );

const ChooseWalletTypeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isSelectWalletTypeModalOpen, setIsSelectWalletTypeModalOpen] =
    useState(false);

  return (
    <ChooseWalletTypeContext.Provider
      value={{ isSelectWalletTypeModalOpen, setIsSelectWalletTypeModalOpen }}
    >
      {children}
    </ChooseWalletTypeContext.Provider>
  );
};

export default ChooseWalletTypeProvider;
