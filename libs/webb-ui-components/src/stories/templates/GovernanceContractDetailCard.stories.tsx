import type { Meta, StoryObj } from '@storybook/react';
import GovernanceContractDetailCard from '../../containers/GovernanceContractDetailCard';
import { VAnchor__factory } from '@webb-tools/contracts';
import { randEthereumAddress } from '@ngneat/falso';
import { shortenHex } from '../../utils';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';

const meta: Meta<typeof GovernanceContractDetailCard> = {
  title: 'Design System/Templates/GovernanceContractDetailCard',
  component: GovernanceContractDetailCard,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof GovernanceContractDetailCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <GovernanceContractDetailCard
      metadata={[
        {
          title: 'Name',
          detailsCmp: 'Webb Table',
        },
        {
          title: 'Address',
          detailsCmp: shortenHex(randEthereumAddress()),
        },
      ]}
      abi={VAnchor__factory.abi}
      governanceFncNames={['setHandler', 'setVerifier']}
      typedChainIdSelections={Object.keys(chainsConfig)
        .slice(0, 8)
        .map((typedChainId) => +typedChainId)}
    />
  ),
};
