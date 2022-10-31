import React from 'react';

import { ChainInput } from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/ChainInput',
  component: ChainInput,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ChainInput {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};

export const asDestinationChain = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
asDestinationChain.args = {
  chainType: 'dest',
  chain: {
    name: 'Optimism',
    symbol: 'op',
  },
};

export const asSourceChain = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
asSourceChain.args = {
  chainType: 'source',
  chain: {
    name: 'Ethereum',
    symbol: 'eth',
  },
};
