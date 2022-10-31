import React from 'react';

import { DepositCard } from '@webb-tools/webb-ui-components/containers/DepositCard';
import { withRouter } from 'storybook-addon-react-router-v6';
export default {
  title: 'Design System/Templates/DepositCard',
  component: DepositCard,
  decorators: [withRouter],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <div className="flex justify-center">
    <DepositCard {...args} />
  </div>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  className: 'mx-auto',
  buttonProps: {
    children: 'Connect wallet',
  },
};
