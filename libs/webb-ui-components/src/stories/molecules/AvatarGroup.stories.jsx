import React from 'react';

import { Avatar, AvatarGroup } from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/AvatarGroup',
  component: AvatarGroup,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <AvatarGroup {...args}>
    <Avatar src="https://webb-assets.s3.amazonaws.com/WebbLogo.svg" />
    <Avatar src="https://webb-assets.s3.amazonaws.com/WebbLogo.svg" />
  </AvatarGroup>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  total: 2,
};
