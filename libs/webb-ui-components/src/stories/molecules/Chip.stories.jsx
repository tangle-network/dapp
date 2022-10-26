import React from 'react';

import { Chip } from '@nepoche/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Chip',
  component: Chip,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Chip {...args}>Active</Chip>;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  color: 'yellow',
  isDisabled: false,
};

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'green',
  isDisabled: true,
};
