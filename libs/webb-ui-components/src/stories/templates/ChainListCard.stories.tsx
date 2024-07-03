import type { Meta, StoryObj } from '@storybook/react';
import ChainListCard from '../../components/ListCard/ChainListCard';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';

const meta: Meta<typeof ChainListCard> = {
  title: 'Design System/V2 (WIP)/Templates/ChainListCard',
  component: ChainListCard,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof ChainListCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <ChainListCard
      activeTypedChainId={+Object.keys(chainsConfig)[0]}
      chainType="source"
      chains={Object.entries(chainsConfig).map(([typedChainId, chain]) => ({
        typedChainId: +typedChainId,
        name: chain.name,
        tag: chain.tag,
        needSwitchWallet: chain.chainType !== ChainType.EVM,
      }))}
    />
  ),
};
