import type { Meta, StoryObj } from '@storybook/react';

import TokenSelector from '../../components/TokenSelector';

const meta: Meta<typeof TokenSelector> = {
  title: 'Design System/Molecules/TokenSelector',
  component: TokenSelector,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof TokenSelector>;

export const Default: Story = {
  render: () => <TokenSelector />,
};

export const Disabled: Story = {
  render: () => <TokenSelector isDisabled />,
};

export const WithToken: Story = {
  render: () => <TokenSelector children="WETH" />,
};

export const ShieldedDefault: Story = {
  render: () => <TokenSelector tokenType="shielded" />,
};

export const ShieldedToken: Story = {
  render: () => <TokenSelector tokenType="shielded" children="webbETH" />,
};
