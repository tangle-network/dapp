import type { Meta, StoryObj } from '@storybook/react';
import { chainsConfig } from '@webb-tools/dapp-config/chains/evm';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import ChainButton from '../../components/buttons/ChainButton';

const meta: Meta<typeof ChainButton> = {
  title: 'Design System/V2 (WIP)/Molecules/ChainButton',
  component: ChainButton,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof ChainButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <ChainButton chain={chainsConfig[PresetTypedChainId.Sepolia]} />
  ),
};

export const WithStatus: Story = {
  render: () => (
    <ChainButton
      chain={chainsConfig[PresetTypedChainId.Sepolia]}
      status="success"
    />
  ),
};
