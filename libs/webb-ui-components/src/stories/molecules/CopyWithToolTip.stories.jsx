import React from 'react';

import { CopyWithTooltip } from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/CopyWithTooltip',
  component: CopyWithTooltip,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <CopyWithTooltip {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  textToCopy: '0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7',
};

export const isUseSpan = Template.bind({});
isUseSpan.args = {
  isUseSpan: true,
  textToCopy: '0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7',
};
