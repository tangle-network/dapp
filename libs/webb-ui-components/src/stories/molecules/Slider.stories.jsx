import React from 'react';

import { Slider } from '@nepoche/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Slider',
  component: Slider,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Slider {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  className: 'mt-4',
  defaultValue: [25],
};

export const Secondary = Template.bind({});
Secondary.args = {
  className: 'mt-4',
  defaultValue: [25],
  hasLabel: true,
};
