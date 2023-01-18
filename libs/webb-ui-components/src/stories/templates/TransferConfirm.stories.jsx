import React from 'react';

import { TransferConfirm } from '@webb-tools/webb-ui-components/containers';
import { withRouter } from 'storybook-addon-react-router-v6';
export default {
  title: 'Design System/Templates/TransferConfirm',
  component: TransferConfirm,
  decorators: [withRouter],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <div className="flex justify-center">
    <TransferConfirm {...args} />
  </div>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title: 'Transfer In-Progress',
  progress: 25,
  activeChains: ['Optimism', 'Arbitrum'],
  note: 'webb://v2:vanchor/1099511627780:109951123431284u182p347130287412083741289341238412472389741382974',
  amount: 1.01,
  changeAmount: 2.02,
  fee: 0.001,
  fungibleTokenSymbol: 'weth',
  sourceChain: 'Optimism',
  relayerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  relayerExternalUrl: 'https://webb.tools/relayer',
  recipientAddress: '0xb507EcE3132875277d05045Bb1C914088A506443',
  destChain: 'Arbitrum',
};
