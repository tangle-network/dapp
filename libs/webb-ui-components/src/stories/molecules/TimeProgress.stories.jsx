import React from 'react';
import { randRecentDate, randSoonDate } from '@ngneat/falso';
import { TimeProgress } from '@nepoche/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/TimeProgress',
  component: TimeProgress,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <TimeProgress {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  startTime: randRecentDate(),
  endTime: randSoonDate(),
};
