import { InfoItem } from '../../components/BridgeInputs/InfoItem';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/InfoItem',
  component: InfoItem,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <InfoItem {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  leftTextProps: {
    title: 'Depositing',
    variant: 'utility',
    info: 'Depositing',
  },
};

// TODO: investigate rightContent props
export const WithRightContent = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithRightContent.args = {
  ...Default.args,
  rightContent: '100/ETH',
};
