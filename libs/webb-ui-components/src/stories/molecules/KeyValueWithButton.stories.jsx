import React from 'react';

import { KeyValueWithButton } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/KeyValueWithButton',
  component: KeyValueWithButton,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <KeyValueWithButton {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  keyValue: '0x958aa9ddbd62f989dec2fd1468bf436aebeb8be6',
  size: 'sm',
};

export const withShortenValue = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  keyValue: '0x958aa9ddbd62f989dec2fd1468bf436aebeb8be6',
  size: 'sm',
};
