import { NavigationMenu, NavigationMenuContent, NavigationMenuTrigger } from '@webb-dapp/webb-ui-components/components';
import React from 'react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/TopNavigationMenu',
  component: NavigationMenu,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = () => (
  <NavigationMenu>
    <NavigationMenuTrigger />
    <NavigationMenuContent version='2.0.7' />
  </NavigationMenu>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
