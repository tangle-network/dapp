import { WalletConnectionCard } from '@webb-tools/webb-ui-components/components';
import { withRouter } from 'storybook-addon-react-router-v6';
import {
  MetaMaskIcon,
  PolkadotJsIcon
} from '@webb-tools/icons';
import { WalletId } from '@webb-tools/dapp-types/WalletId';

export default {
  title: 'Design System/Templates/WalletConnectionCard',
  component: WalletConnectionCard,
  decorators: [withRouter],
};

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
        return (window).web3.__isMetaMaskShim__
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

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <WalletConnectionCard {...args} />;

export const Default = Template.bind({});

// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = { 
 wallets
};

export const Failed = Template.bind({});
Failed.args = { wallets, failedWalletId: WalletId.MetaMask };

export const Loading = Template.bind({});
Loading.args = { wallets, connectingWalletId: WalletId.MetaMask };
