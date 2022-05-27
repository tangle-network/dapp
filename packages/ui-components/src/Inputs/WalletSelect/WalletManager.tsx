import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useWallets } from '@webb-dapp/react-hooks/useWallets';
import { ManagedWallet } from '@webb-tools/api-providers';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ConnectedWalletView } from './ConnectedWalletView';
import { DisconnectedWalletView } from './DisconnectedWalletView';

const WalletManagerWrapper = styled.div`
  width: 440px;
  padding: 20px;
`;

type WalletManagerProps = {
  close(): void;
};

export const WalletManager: React.FC<WalletManagerProps> = ({ close }) => {
  const { wallets } = useWallets();
  const [selectedWallet, setSelectedWallet] = useState<ManagedWallet | null>(null);
  const { activeChain, switchChain } = useWebContext();

  useEffect(() => {
    const nextWallet = wallets.find(({ connected }) => connected);
    if (nextWallet) {
      setSelectedWallet(nextWallet);
    }
  }, [wallets, setSelectedWallet]);

  return (
    <WalletManagerWrapper>
      {!selectedWallet && (
        <DisconnectedWalletView
          wallets={wallets}
          setSelectedWallet={async (wallet) => {
            if (activeChain) {
              await switchChain(activeChain, wallet);
            }
          }}
          close={close}
        />
      )}
      {selectedWallet && (
        <>
          <ConnectedWalletView
            close={close}
            connectedWallet={selectedWallet}
            disconnectWallet={() => {
              if (selectedWallet.canEndSession) {
                selectedWallet.endSession();
              }
              setSelectedWallet(null);
            }}
          />
        </>
      )}
    </WalletManagerWrapper>
  );
};
