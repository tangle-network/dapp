import React from 'react';

import { Socials } from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Socials',
  component: Socials,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Socials {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};

export const Start = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Start.args = {
  iconPlacement: 'start',
};

export const Center = Template.bind({});
Center.args = {
  iconPlacement: 'center',
};

export const End = Template.bind({});
End.args = {
  iconPlacement: 'end',
};
