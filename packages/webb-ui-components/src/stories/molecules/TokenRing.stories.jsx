import React from 'react';

import { TokensRing } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/TokensRing',
  component: TokensRing,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <TokensRing {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  sourceLabel: 'depositing from',
  destLabel: 'depositing to',
  sourceChain: 'eth',
  destChain: 'dot',
  amount: '100',
  tokenPairString: `ETH/DOT`,
};
