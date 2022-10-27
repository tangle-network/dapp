import React from 'react';

import { TokenInput } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/TokenInput',
  component: TokenInput,
  // TODO: investigate using controls to display all options for token selection
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <TokenInput {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const withToken = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
withToken.args = {
  ...Default.args,
  token: {
    symbol: 'eth',
    balance: 1.2,
    balanceInUsd: 100,
  },
};
