import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { WalletSelect } from '@webb-dapp/ui-components/Inputs/WalletSelect/WalletSelect';
import { NetworkManager } from '@webb-dapp/ui-components/NetworkManager/NetworkManager';
import React from 'react';

type RequiredWalletSelectionProps = {};

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
