import type { Meta, StoryObj } from '@storybook/react';
import { chainsConfig } from '@webb-tools/dapp-config/chains/evm';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import ChainOrTokenButton from '../../components/buttons/ChainOrTokenButton';

const meta: Meta<typeof ChainOrTokenButton> = {
  title: 'Design System/Molecules/ChainOrTokenButton',
  component: ChainOrTokenButton,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof ChainOrTokenButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Chain: Story = {
  render: () => (
    <ChainOrTokenButton
      value={chainsConfig[PresetTypedChainId.Sepolia].name}
      iconType="chain"
    />
  ),
};

export const WithStatus: Story = {
  render: () => (
    <ChainOrTokenButton
      value={chainsConfig[PresetTypedChainId.Sepolia].name}
      status="success"
      iconType="chain"
    />
  ),
};

export const Token: Story = {
  render: () => <ChainOrTokenButton value="eth" iconType="token" />,
};
