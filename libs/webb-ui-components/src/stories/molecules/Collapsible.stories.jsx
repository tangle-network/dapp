import React from 'react';

import {
  Collapsible,
  CollapsibleButton,
  CollapsibleContent,
} from '@webb-tools/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Collapsible',
  component: Collapsible,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <Collapsible>
    <CollapsibleButton>Click to expand</CollapsibleButton>
    <CollapsibleContent>Expanded section</CollapsibleContent>
  </Collapsible>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
