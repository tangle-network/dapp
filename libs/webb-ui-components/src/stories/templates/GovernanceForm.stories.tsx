import type { Meta, StoryObj } from '@storybook/react';
import GovernanceForm from '../../components/GovernanceForm/GovernanceForm';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { VAnchor__factory } from '@webb-tools/contracts';

const meta: Meta<typeof GovernanceForm> = {
  title: 'Design System/Templates/GovernanceForm',
  component: GovernanceForm,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof GovernanceForm>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <GovernanceForm
      governanceFncNames={['setHandler', 'setVerifier']}
      typedChainIdSelections={Object.keys(chainsConfig)
        .slice(0, 8)
        .map((chainId) => +chainId)}
      abi={VAnchor__factory.abi}
    />
  ),
};
