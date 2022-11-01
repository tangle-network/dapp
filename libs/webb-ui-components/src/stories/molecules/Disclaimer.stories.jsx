import React from 'react';

import { Disclaimer } from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Disclaimer',
  component: Disclaimer,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Disclaimer {...args} />;

export const SuccessDisclaimer = Template.bind({});
SuccessDisclaimer.args = {
  message: 'Information were store successfully',
  variant: 'success',
};

export const WarningDisclaimer = Template.bind({});
WarningDisclaimer.args = {
  message: `Make sure to store the info manually if it's failed to be stored automatically`,
  variant: 'warning',
};

export const ErrorDisclaimer = Template.bind({});
ErrorDisclaimer.args = {
  message: 'Failed to store the data automatically',
  variant: 'error',
};

export const InfoDisclaimer = Template.bind({});
InfoDisclaimer.args = {
  message: `Data is manually stored every 10s`,
  variant: 'info',
};
