import type { Meta, StoryObj } from '@storybook/react';

import TokenListItem from '../../components/ListCard/TokenListItem';
import noop from 'lodash/noop';

const meta: Meta<typeof TokenListItem> = {
  title: 'Design System/Molecules/TokenListItem',
  component: TokenListItem,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof TokenListItem>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => <TokenListItem id="eth" name="Ethereum" symbol="ETH" />,
};

export const Disabled: Story = {
  render: () => (
    <TokenListItem id="eth" isDisabled name="Ethereum" symbol="ETH" />
  ),
};

export const WithBalance: Story = {
  render: () => (
    <TokenListItem
      id="eth"
      name="Ethereum"
      symbol="ETH"
      assetBalanceProps={{ balance: 0, balanceInUsd: 0 }}
    />
  ),
};

export const AddTokenToWallet: Story = {
  render: () => (
    <TokenListItem id="eth" name="Ethereum" symbol="ETH" onAddToken={noop} />
  ),
};

export const WithWarningBadge: Story = {
  render: () => (
    <TokenListItem
      id="webbEth"
      name="Webb Ethereum"
      symbol="webbETH"
      assetBadgeProps={{
        variant: 'warning',
        children: 'Low liquidity',
      }}
    />
  ),
};

export const WithInfoBadge: Story = {
  render: () => (
    <TokenListItem
      id="webbETH"
      name="Webb Ethereum"
      symbol="webbETH"
      assetBadgeProps={{
        variant: 'info',
        children: 'Switch chain',
      }}
    />
  ),
};

export const ShieldedPoolItem: Story = {
  render: () => (
    <TokenListItem
      id="webbETH"
      name="Webb Ethereum"
      symbol="webbETH"
      tokenType="shielded"
      explorerUrl="https://webb.tools"
      assetBalanceProps={{
        balance: 0,
      }}
    />
  ),
};

export const ShieldedPoolItemWithChain: Story = {
  render: () => (
    <TokenListItem
      id="webbETH"
      name="Webb Ethereum"
      symbol="webbETH"
      tokenType="shielded"
      explorerUrl="https://webb.tools"
      chainName="Polygon Mumbai"
      assetBalanceProps={{
        balance: 0,
        subContent: 'Webb Ethereum',
      }}
    />
  ),
};
