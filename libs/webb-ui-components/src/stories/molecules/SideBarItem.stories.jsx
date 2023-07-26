import React from 'react';

import { SideBarItem } from '@webb-tools/webb-ui-components/components';
import { ContrastTwoLine } from '@webb-tools/icons';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/SideBarItem',
  component: SideBarItem,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <SideBarItem {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  isSidebarOpen: true,
  name: 'Hubble',
  isInternal: true,
  href: '',
  Icon: ContrastTwoLine,
  subItems: [
    {
      name: 'Bridge',
      isInternal: false,
      //   href: '#',
    },
    {
      name: 'Explorer',
      isInternal: true,
      //   href: '#',
    },
    {
      name: 'Faucet',
      isInternal: false,
      //   href: '#',
    },
  ],
};
