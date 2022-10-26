import React from 'react';

import { Chip, Tooltip, TooltipBody, TooltipTrigger } from '@nepoche/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Tooltip',
  component: Tooltip,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <Tooltip isDefaultOpen>
    <TooltipTrigger>
      <Chip color='blue'>Text only</Chip>
    </TooltipTrigger>
    <TooltipBody>
      <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>
    </TooltipBody>
  </Tooltip>
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
