import React from 'react';

import { KeyStatusCard } from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Molecules/KeyStatusCard',
  component: KeyStatusCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  //   argTypes: {
  //     backgroundColor: { control: 'color' },
  //   },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <KeyStatusCard {...args}/>;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  className:'max-w-[680px] mt-6',
  title: 'current',
  // titleInfo: keyType === "The public key of the DKG protocol that is currently active."
};

// export const Large = Template.bind({});
// // More on args: https://storybook.js.org/docs/react/writing-stories/args
// Large.args = {
//   size: 'lg',
// };
