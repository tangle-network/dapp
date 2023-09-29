import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Modal,
  ModalContent,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useState } from 'react';
import { useConnectWallet } from './useConnectWallet';

export const useTryAnotherWalletWithView = () => {
  const { switchWallet, connectingWalletId, failedWalletId, selectedWallet } =
    useConnectWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { activeChain: chain, apiConfig } = useWebContext();

  const TryAnotherWalletModal = useCallback<FC>(
    () => {
      if (!chain) {
        return null;
      }

      return (
        <Modal open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
          <ModalContent isOpen={isModalOpen} isCenter>
            <WalletConnectionCard
              wallets={chain.wallets.map((id) => apiConfig.wallets[id])}
              onWalletSelect={async (wallet) => {
                await switchWallet(chain, wallet);
              }}
              onClose={() => setIsModalOpen(false)}
              connectingWalletId={connectingWalletId}
              failedWalletId={failedWalletId}
              onTryAgainBtnClick={async () => {
                if (!selectedWallet) {
                  throw new Error(
                    'There is no wallet selected. Please select a wallet and try again.'
                  );
                }
                await switchWallet(chain, selectedWallet);
              }}
            />
          </ModalContent>
        </Modal>
      );
    },
    // prettier-ignore
    [apiConfig.wallets, chain, connectingWalletId, failedWalletId, isModalOpen, selectedWallet, switchWallet]
  );

  const onTryAnotherWallet = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return {
    onTryAnotherWallet,
    TryAnotherWalletModal,
  };
};
