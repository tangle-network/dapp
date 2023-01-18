import { WalletConnectionCard } from '@webb-tools/webb-ui-components/components';
import { withRouter } from 'storybook-addon-react-router-v6';
import { walletsConfig, WalletId } from '@webb-tools/dapp-config'

export default {
  title: 'Design System/Templates/WalletConnectionCard',
  component: WalletConnectionCard,
  decorators: [withRouter],
};

const wallets = walletsConfig;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <WalletConnectionCard {...args} />;

export const Default = Template.bind({});

// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = { 
 wallets
};

export const Failed = Template.bind({});
Failed.args = { wallets, failedWalletId: WalletId.Polkadot, connectingWalletId: WalletId.MetaMask };

export const Loading = Template.bind({});
Loading.args = { wallets, connectingWalletId: WalletId.Polkadot };
