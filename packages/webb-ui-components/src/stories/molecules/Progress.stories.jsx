import React from 'react';

import { Progress } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Progress',
  component: Progress,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Progress {...args} />

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  size: 'md',
  value: '60'
};

export const withMax = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
withMax.args = {
  ...Default.args,
  max: '70',
};
