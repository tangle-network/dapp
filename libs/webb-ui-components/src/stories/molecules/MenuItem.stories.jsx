import React from 'react';

import { MenuItem } from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/MenuItem',
  component: MenuItem,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <MenuItem {...args}>Item 1</MenuItem>;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};

//TODO: how to pass component as prop
// export const withIcon = Template.bind({});
// // More on args: https://storybook.js.org/docs/react/writing-stories/args
// withIcon.args = {
//   icon:
// };
