import React from 'react';

import { Card, TitleWithInfo, TokenSelector } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Card',
  component: Card,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <Card {...args}>
    <TitleWithInfo title='Token Selector' variant='h4' />
    <div className='flex items-center space-x-4'>
      <TokenSelector>ETH</TokenSelector>
      <TokenSelector>DOT</TokenSelector>
      <TokenSelector isActive>KSM</TokenSelector>
    </div>
  </Card>
);

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {};
