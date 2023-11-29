import type { Meta, StoryObj } from '@storybook/react';
import GovernanceContractListingCard from '../../containers/GovernanceContractListingCard';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { randEthereumAddress } from '@ngneat/falso';

const meta: Meta<typeof GovernanceContractListingCard> = {
  title: 'Design System/Templates/GovernanceContractListingCard',
  component: GovernanceContractListingCard,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof GovernanceContractListingCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <GovernanceContractListingCard
      typedChainIdSelections={Object.keys(chainsConfig)
        .slice(0, 8)
        .map((typedChainId) => +typedChainId)}
      selectedTypedChainId={+Object.keys(chainsConfig)[0]}
      selectContractItems={[
        {
          name: 'Webb Ethereum',
          address: randEthereumAddress(),
          blockExplorerUrl: 'https://etherscan.io',
        },
        {
          name: 'Webb Tangle',
          address: randEthereumAddress(),
          blockExplorerUrl: 'https://etherscan.io',
        },
      ]}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <GovernanceContractListingCard
      typedChainIdSelections={Object.keys(chainsConfig)
        .slice(0, 8)
        .map((typedChainId) => +typedChainId)}
      selectedTypedChainId={+Object.keys(chainsConfig)[0]}
      isLoadingList
      selectContractItems={[]}
    />
  ),
};
