import { Chain } from '@webb-tools/dapp-config';
import {
  ChainListCard,
  Modal,
  ModalContent,
  useWebbUI,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ChainType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import { FC } from 'react';
import { useConnectWallet } from '../../hooks';
import { getPlatformMetaData } from '@webb-tools/browser-utils';
import { walletsConfig } from '@webb-tools/dapp-config';
import { WalletId } from '@webb-tools/dapp-types';

export type WalletModalProps = {
  sourceChains: ChainType[];
  chain: Chain;
};
export const WalletModal: FC<WalletModalProps> = ({ chain, sourceChains }) => {
  const { setMainComponent } = useWebbUI();
  const {
    isModalOpen,
    toggleModal,
    switchWallet,
    connectingWalletId,
    failedWalletId,
    selectedWallet,
  } = useConnectWallet(true);

  return (
    <>
      <ChainListCard
        className="w-[550px] h-[700px]"
        chainType="source"
        chains={sourceChains}
        onClose={() => {
          setMainComponent(undefined);
        }}
      />
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => {
          toggleModal(open);

          if (!open) {
            setMainComponent(undefined);
          }
        }}
      >
        <ModalContent isOpen={isModalOpen} isCenter>
          <WalletConnectionCard
            wallets={Object.values(chain.wallets)}
            onWalletSelect={async (wallet) => {
              await switchWallet(chain, wallet);
            }}
            onClose={() => setMainComponent(undefined)}
            connectingWalletId={connectingWalletId}
            failedWalletId={failedWalletId}
            onTryAgainBtnClick={async () => {
              if (!selectedWallet) {
                throw new Error(
                  'There is not selected wallet in try again function'
                );
              }
              await switchWallet(chain, selectedWallet);
            }}
            onDownloadBtnClick={() => {
              const { id } = getPlatformMetaData();

              window.open(
                walletsConfig[WalletId.MetaMask].installLinks?.[id],
                '_blank'
              );
            }}
          />
        </ModalContent>
      </Modal>
    </>
  );
};
