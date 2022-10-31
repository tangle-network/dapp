import React from 'react';

import { WithdrawCard } from '@webb-tools/webb-ui-components/containers/WithdrawCard';
import { withRouter } from 'storybook-addon-react-router-v6';
export default {
  title: 'Design System/Templates/WithdrawCard',
  component: WithdrawCard,
  decorators: [withRouter],
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <div className="flex justify-center">
    <WithdrawCard {...args} />
  </div>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  className: 'mx-auto',
};
