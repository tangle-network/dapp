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

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <WalletConnectionCard {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  wallets: [
    {
      id: 'metamask',
      name: 'MetaMask',
      logo: <MetaMaskIcon />,
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      logo: <WalletConnectIcon />,
    },
    {
      id: 'polkadot-js',
      name: 'Polkadot-JS',
      logo: <PolkadotJsIcon />,
    },
    {
      id: 'talisman',
      name: 'Talisman',
      logo: <TalismanIcon />,
    },
    {
      id: 'subwallet',
      name: 'Subwallet',
      logo: <SubWalletIcon />,
    },
  ],
};
