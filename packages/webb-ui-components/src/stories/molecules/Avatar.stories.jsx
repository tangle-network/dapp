import React from 'react';

import { Avatar } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Avatar',
  component: Avatar,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
//   argTypes: {
//     backgroundColor: { control: 'color' },
//   },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Avatar {...args}/>;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  key: '2',
  size: 'md',
  src:  "./assets/Logo.png",
  sourceVariant: 'address'
};

// export const Large = Template.bind({});
// // More on args: https://storybook.js.org/docs/react/writing-stories/args
// Large.args = {
//   size: 'lg',
// };

// export const Medium = Template.bind({});
// Medium.args = {
//   size: 'md',
// };
