import { Alert } from '../../components/Alert';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Alert',
  component: Alert,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Alert {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'Title',
};

export const Success = Template.bind({});
Success.args = {
  title: 'Title',
  type: 'success',
};

export const Error = Template.bind({});
Error.args = {
  title: 'Title',
  type: 'error',
};

export const WithDescription = Template.bind({});
WithDescription.args = {
  title: 'Title',
  description: 'Description',
};
