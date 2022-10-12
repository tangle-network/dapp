import React from 'react';

import { TokenInput } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Molecules/TokenInput',
  component: TokenInput,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
//   argTypes: {
//     backgroundColor: { control: 'color' },
//   },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <TokenInput {...args} />;

export const Default = Template.bind({});
Default.args = {
};

// export const Eth = Template.bind({});
// Eth.args = {
//   token: { 
//     symbol: 'eth', 
//     balance: 1.2, 
//     balanceInUsd: 1000 }
// };