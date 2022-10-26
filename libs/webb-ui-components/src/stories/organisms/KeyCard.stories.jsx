import React from 'react';

import { KeyCard } from '@nepoche/webb-ui-components/components';

export default {
  title: 'Design System/Organisms/KeyCard',
  component: KeyCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <KeyCard {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title: 'Compressed Key:',
  keyValue: '0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7',
};
