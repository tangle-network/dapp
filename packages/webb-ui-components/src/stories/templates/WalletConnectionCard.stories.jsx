import { WalletConnectionCard } from '@webb-dapp/webb-ui-components/components';
import {
  MetaMaskIcon,
  PolkadotJsIcon,
  SubWalletIcon,
  TalismanIcon,
  WalletConnectIcon,
} from '@webb-dapp/webb-ui-components/icons';
import { withRouter } from 'storybook-addon-react-router-v6';

export default {
  title: 'Design System/Templates/WalletConnectionCard',
  component: WalletConnectionCard,
  decorators: [withRouter],
};

const wallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    title: 'MetaMask Wallet',
    logo: <MetaMaskIcon />,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    title: 'WalletConnect',
    logo: <WalletConnectIcon />,
  },
  {
    id: 'polkadot-js',
    name: 'Polkadot-JS',
    title: 'Polkadot-JS Wallet',
    logo: <PolkadotJsIcon />,
  },
  {
    id: 'talisman',
    name: 'Talisman',
    title: 'Talisman Wallet',
    logo: <TalismanIcon />,
  },
  {
    id: 'subwallet',
    name: 'Subwallet',
    title: 'Subwallet',
    logo: <SubWalletIcon />,
  },
];

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <WalletConnectionCard {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = { wallets };

export const Failed = Template.bind({});
Failed.args = { wallets, failedWalletId: wallets[0].id };

export const Loading = Template.bind({});
Loading.args = { wallets, connectingWalletId: wallets[2].id };
