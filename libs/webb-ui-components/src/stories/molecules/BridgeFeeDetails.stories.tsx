import type { Meta, StoryObj } from '@storybook/react';
import BridgeFeeDetails from '../../containers/BridgeFeeDetails';

const meta: Meta<typeof BridgeFeeDetails> = {
  title: 'Design System/V2 (WIP)/Molecules/BridgeFeeDetails',
  component: BridgeFeeDetails,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof BridgeFeeDetails>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <BridgeFeeDetails bridgeFeeInfo="Total fees" gasFeeInfo="Gas fee" />
  ),
};

export const WithGasFee: Story = {
  render: () => (
    <BridgeFeeDetails
      bridgeFeeInfo="Total fees"
      gasFeeInfo="Gas fee"
      gasFee={0.05}
      gasFeeToken="webbETH"
      gasFeeInUSD={89.21}
    />
  ),
};

export const WithRelayerFee: Story = {
  render: () => (
    <BridgeFeeDetails
      bridgeFeeInfo="Total fees"
      gasFeeInfo="Gas fee"
      gasFee={0.04}
      gasFeeToken="webbETH"
      gasFeeInUSD={89.21}
      relayerFee={0.01}
      relayerFeeToken="webbETH"
      relayerFeeInUSD={23.32}
      relayerFeeInfo="Relayer fee"
      relayerFeePercentage={1}
    />
  ),
};
