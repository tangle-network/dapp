import { withRouter } from 'storybook-addon-react-router-v6';
import { useState } from 'react';
import { Modal } from '../../components/Modal/Modal';
import { ModalTrigger } from '../../components/Modal/ModalTrigger';
import { ModalContent } from '../../components/Modal/ModalContent';
import { WalletConnectionCard } from '../../components/WalletConnectionCard';
import { Button } from '../../components/Button';
import { MetaMaskIcon, PolkadotJsIcon } from '@webb-tools/icons';
import { WalletId } from '@webb-tools/dapp-types/WalletId';

const walletsConfig = {
  [WalletId.MetaMask]: {
    id: WalletId.MetaMask,
    Logo: <MetaMaskIcon />,
    name: 'metamask',
    title: `MetaMask`,
    platform: 'EVM',
    enabled: true,
    detect() {
      const hasWeb3 = web3 !== 'undefined';
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

let wallets = Object.values(walletsConfig);

export default {
  title: 'Design System/Organisms/Modal',
  component: Modal,
  decorators: [withRouter],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <ModalTrigger asChild>
        <Button>Click me</Button>
      </ModalTrigger>
      <ModalContent
        className="flex items-center justify-center"
        isOpen={isOpen}
      >
        <WalletConnectionCard
          onClose={() => setIsOpen(false)}
          wallets={wallets}
        />
      </ModalContent>
    </Modal>
  );
};

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
