import React, { useState } from 'react';

import { AmountMenu } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/AmountMenu',
  component: AmountMenu,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <AmountMenu {...args} />;

export const Default = Template.bind({});

// TODO: investigate how to make use of control / onChange handler
Default.args = {
  selected: 'fixed',
  //   onChange: {handleOnChange}
};
