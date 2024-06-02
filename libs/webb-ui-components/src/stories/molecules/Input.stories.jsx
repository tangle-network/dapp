import { Input } from '../../components/Input/Input';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Input',
  component: Input,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Input {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  id: 'Default',
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  id: 'default',
  placeholder: 'With placeholder',
  className: 'mt-3',
};

export const WithReadonly = Template.bind({});
WithReadonly.args = {
  id: 'readonly',
  value: 'Readonly',
  isReadOnly: true,
  className: 'mt-3',
};
// TODO: Figure out how to pass component as prop
export const IsDisabled = Template.bind({});
IsDisabled.args = {
  id: 'disabled',
  name: 'disabled',
  value: 'disabled',
  isDisabled: true,
  className: 'mt-3',
};

export const IsInvalid = Template.bind({});
IsInvalid.args = {
  id: 'invalid',
  value: 'isInvalid',
  isInvalid: true,
  className: 'mt-3',
};

export const WithError = Template.bind({});
WithError.args = {
  id: 'withError',
  value: 'withError',
  isInvalid: true,
  errorMessage: 'Error message',
  className: 'mt-3',
};
