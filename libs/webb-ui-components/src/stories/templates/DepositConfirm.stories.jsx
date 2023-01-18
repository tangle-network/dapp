import React from 'react';

import { DepositConfirm } from '@webb-tools/webb-ui-components/containers';
import { withRouter } from 'storybook-addon-react-router-v6';
export default {
  title: 'Design System/Templates/DepositConfirm',
  component: DepositConfirm,
  decorators: [withRouter],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <div className="flex justify-center">
    <DepositConfirm {...args} />
  </div>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title:"Deposit In-Progress",
  activeChains:['Optimism', 'Arbitrum'],
  progress: 75,
  note: 'webb://v2:vanchor/1099511627780:109951123431284u182p347130287412083741289341238412472389741382974',
  amount: 1.01,
  wrappingAmount: 1.01,
  fee: 0.001,
  fungibleTokenSymbol: 'eth',
  wrappableTokenSymbol: 'weth',
  sourceChain: 'Optimism',
  destChain: 'Arbitrum',
};
