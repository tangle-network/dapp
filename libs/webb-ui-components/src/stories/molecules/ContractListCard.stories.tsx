import type { Meta, StoryObj } from '@storybook/react';
import ContractListCard from '../../components/ListCard/ContractListCard';
import { randEthereumAddress } from '@ngneat/falso';

const meta: Meta<typeof ContractListCard> = {
  title: 'Design System/Molecules/ContractListCard',
  component: ContractListCard,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof ContractListCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <ContractListCard
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
  render: () => <ContractListCard selectContractItems={[]} isLoading />,
};
