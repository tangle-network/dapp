import { CopyWithTooltip } from '../../components/CopyWithTooltip';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/CopyWithTooltip',
  component: CopyWithTooltip,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <CopyWithTooltip {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  textToCopy: '0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7',
};

export const IsUseSpan = Template.bind({});
IsUseSpan.args = {
  isUseSpan: true,
  textToCopy: '0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7',
};
