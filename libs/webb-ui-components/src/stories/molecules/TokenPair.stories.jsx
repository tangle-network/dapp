import React from 'react';
import { TokenPair } from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/TokenPair',
  component: TokenPair,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <TokenPair {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  token1Symbol: 'ETH',
  token2Symbol: 'DOT',
};

export const WithBalance = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithBalance.args = {
  ...Default.args,
  balance: '100',
  balanceInUsd: '2500',
};

export const WithPoolName = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithPoolName.args = {
  ...Default.args,
  ...WithBalance.args,
  name: 'Pool : ETH/DOT',
};
