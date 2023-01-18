import { withRouter } from 'storybook-addon-react-router-v6';
import { useState } from 'react';
import { Modal } from '../../components/Modal/Modal';
import { ModalTrigger } from '../../components/Modal/ModalTrigger';
import { ModalContent } from '../../components/Modal/ModalContent';
import { WalletConnectionCard } from '../../components/WalletConnectionCard';
import { Button } from '../../components/Button';

const wallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    title: 'MetaMask Wallet',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    title: 'WalletConnect',
  },
  {
    id: 'polkadot-js',
    name: 'Polkadot-JS',
    title: 'Polkadot-JS Wallet',
  },
  {
    id: 'talisman',
    name: 'Talisman',
    title: 'Talisman Wallet',
  },
  {
    id: 'subwallet',
    name: 'Subwallet',
    title: 'Subwallet',
  },
];

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
