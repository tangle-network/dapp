import React from 'react';

import { ToolTip, ToolTipTrigger,  ToolTipBody, Chip} from '@webb-dapp/webb-ui-components/components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/ToolTip',
  component: ToolTip,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <ToolTip isDefaultOpen><ToolTipTrigger><Chip color='blue'>Text only</Chip> </ToolTipTrigger><ToolTipBody> <span>A report of a DKG authority misbehaving. (Body xs Regular)</span></ToolTipBody></ToolTip>;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
};