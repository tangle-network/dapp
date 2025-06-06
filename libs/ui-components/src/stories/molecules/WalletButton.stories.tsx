import { randEthereumAddress } from '@ngneat/falso';
import type { Meta, StoryObj } from '@storybook/react';
import { WALLET_CONFIG } from '@tangle-network/dapp-config/wallets/wallets-config';
import { WalletId } from '@tangle-network/dapp-types/WalletId';
import WalletButton from '../../components/buttons/WalletButton';

const meta: Meta<typeof WalletButton> = {
  title: 'Design System/Molecules/WalletButton',
  component: WalletButton,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof WalletButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <WalletButton
      wallet={WALLET_CONFIG[WalletId.MetaMask]}
      address={randEthereumAddress()}
    />
  ),
};
