import { AmountInput } from '../../components/BridgeInputs/AmountInput';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/AmountInput',
  component: AmountInput,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <AmountInput {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  id: 'amount',
};

export const WithAmount = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithAmount.args = {
  id: 'amount',
  amount: '200',
};

export const WithTitle = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithAmount.args = {
  ...WithAmount.args,
  title: 'Enter Amount:',
};
