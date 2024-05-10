import { RecipientInput } from '../../components/BridgeInputs/RecipientInput';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/RecipientInput',
  component: RecipientInput,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <RecipientInput {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
// TODO: investigate rightContent props
export const WithValueInput = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithValueInput.args = {
  ...Default.args,
  value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
};
