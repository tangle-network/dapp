import React from 'react';

import { RelayerInput } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/RelayerInput',
  component: RelayerInput,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <RelayerInput {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
// TODO: investigate rightContent props
export const withValueInput = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
withValueInput.args = {
  ...Default.args,
  relayerAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  externalLink: 'https://webb.tools',
};
