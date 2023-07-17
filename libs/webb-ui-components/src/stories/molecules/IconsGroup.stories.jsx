import { IconsGroup } from '@webb-tools/webb-ui-components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/IconsGroup',
  component: IconsGroup,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <IconsGroup {...args} />;

export const Token = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Token.args = {
  type: 'token',
  icons: ['eth', 'usdc', 'usdt'],
};

export const Chain = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Chain.args = {
  type: 'chain',
  icons: ['ethereum', 'polkadot', 'cosmos'],
};

export const MdSize = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
MdSize.args = {
  type: 'token',
  icons: ['eth', 'usdc', 'usdt'],
  iconSize: 'md',
};

export const XlSize = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
XlSize.args = {
  type: 'token',
  icons: ['eth', 'usdc', 'usdt'],
  iconSize: 'xl',
};
