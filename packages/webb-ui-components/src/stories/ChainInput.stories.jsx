import React from 'react';

import { ChainInput } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Molecules/ChainInput',
  component: ChainInput,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
//   argTypes: {
//     backgroundColor: { control: 'color' },
//   },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ChainInput {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
//   chain: { name: 'Optimism', symbol: 'op' }
};

export const Dest = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Dest.args = {
  chainType: 'dest',
//   chain: { name: 'Optimism', symbol: 'op' }
};

export const Source = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Source.args = {
  chainType: 'source',
};