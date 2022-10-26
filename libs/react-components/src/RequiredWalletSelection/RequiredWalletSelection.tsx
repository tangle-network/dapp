import { useWebContext } from '@nepoche/api-provider-environment';
import { WalletSelect } from '@nepoche/react-components/WalletSelect/WalletSelect';
import { NetworkManager } from '@nepoche/react-components/NetworkManager/NetworkManager';
import React from 'react';

type RequiredWalletSelectionProps = {
  children: React.ReactNode;
};

export const RequiredWalletSelection: React.FC<RequiredWalletSelectionProps> = ({ children }) => {
  const { activeChain, activeWallet } = useWebContext();

  return (
    <>
      {!activeChain && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <NetworkManager />
        </div>
      )}
      {activeChain && !activeWallet && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <WalletSelect />
        </div>
      )}
      {activeWallet && <>{children}</>}
    </>
  );
};
