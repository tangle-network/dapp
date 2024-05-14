import type { Meta, StoryObj } from '@storybook/react';
import { chainsConfig } from '@webb-tools/dapp-config/chains/evm';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import DropdownButton from '../../components/buttons/DropdownButton';

const meta: Meta<typeof DropdownButton> = {
  title: 'Design System/V2 (WIP)/Molecules/DropdownButton',
  component: DropdownButton,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof DropdownButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Chain: Story = {
  render: () => (
    <DropdownButton
      value={chainsConfig[PresetTypedChainId.Sepolia].name}
      iconType="chain"
    />
  ),
};

export const WithStatus: Story = {
  render: () => (
    <DropdownButton
      value={chainsConfig[PresetTypedChainId.Sepolia].name}
      status="success"
      iconType="chain"
    />
  ),
};

export const Token: Story = {
  render: () => <DropdownButton value="eth" iconType="token" />,
};
