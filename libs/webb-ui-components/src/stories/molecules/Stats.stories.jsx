import React from 'react';

import { Stats } from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Stats',
  component: Stats,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Stats {...args} />;

const statsItems = [
  {
    titleProps: {
      title: 'Proposal Threshold',
      info: 'Proposal Threshold',
    },
    value: 3,
  },
];

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  items: statsItems,
};
