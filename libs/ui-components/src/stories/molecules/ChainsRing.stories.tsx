import ChainsRing from '../../components/ChainsRing';
import type { Meta, StoryObj } from '@storybook/react';
import { chainsConfig } from '@tangle-network/dapp-config/chains/chain-config';

const meta: Meta<typeof ChainsRing> = {
  title: 'Design System/Molecules/ChainsRing',
  component: ChainsRing,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof ChainsRing>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <ChainsRing
      chainItems={Object.keys(chainsConfig).map((typedChainId) => {
        return {
          typedChainId: +typedChainId,
        };
      })}
    />
  ),
};
