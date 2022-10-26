import React from 'react';

import { DropdownMenu } from '@nepoche/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/DropdownMenu',
  component: DropdownMenu,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <DropdownMenu {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  className: 'mr-3',
  size: 'sm',
  label: 'Chain',
  menuOptions: ['Day', 'Week', 'Year', 'All Time'],
  value: 'Ethereum',
};
