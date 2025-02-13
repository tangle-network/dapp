import { useState } from 'react';
import { Modal } from '../../components/Modal/Modal';
import { ModalTrigger } from '../../components/Modal/ModalTrigger';
import { ModalContent } from '../../components/Modal/ModalContent';
import { WalletConnectionCard } from '../../components/WalletConnectionCard';
import { Button } from '../../components/buttons';
import { MetaMaskIcon, PolkadotJsIcon } from '@tangle-network/icons';
import { WalletId } from '@tangle-network/dapp-types/WalletId';

const walletsConfig = {
  [WalletId.MetaMask]: {
    id: WalletId.MetaMask,
    Logo: <MetaMaskIcon />,
    name: 'metamask',
    title: `MetaMask`,
    platform: 'EVM',
    enabled: true,
    detect() {
      const hasWeb3 = 'web3' in window;
      if (hasWeb3) {
        return window.web3.__isMetaMaskShim__;
      }
      return false;
    },
    homeLink: 'https://metamask.io/',
  },
  [WalletId.Polkadot]: {
    id: WalletId.Polkadot,
    Logo: <PolkadotJsIcon />,
    name: 'polkadot-js',
    title: `PolkadotJS Extension`,
    platform: 'Substrate',
    enabled: true,
    async detect() {
      return true;
    },
    homeLink: 'https://polkadot.js.org/extension',
  },
};

const wallets = Object.values(walletsConfig);

export default {
  title: 'Design System/Organisms/Modal',
  component: Modal,
};

const Template = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalTrigger asChild>
        <Button>Click me</Button>
      </ModalTrigger>
      <ModalContent>
        <WalletConnectionCard
          onClose={() => setIsOpen(false)}
          wallets={wallets}
        />
      </ModalContent>
    </Modal>
  );
};

export const Default = Template.bind({});

Default.args = {};
