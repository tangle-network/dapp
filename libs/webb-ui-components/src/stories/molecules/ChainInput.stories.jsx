import React from 'react';

import { ChainInput } from '@nepoche/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/ChainInput',
  component: ChainInput,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ChainInput {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};

export const Dest = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Dest.args = {
  chainType: 'dest',
};

export const Source = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Source.args = {
  chainType: 'source',
};
