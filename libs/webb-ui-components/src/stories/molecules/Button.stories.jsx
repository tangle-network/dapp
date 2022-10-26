import React from 'react';

import { Button } from '@nepoche/webb-ui-components/components';
import { ArrowLeft, ArrowRight, Close, Expand, Spinner } from '@nepoche/webb-ui-components/icons';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Design System/Molecules/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Button {...args}>Click Me</Button>;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  size: 'md',
  variant: 'primary',
};

export const Large = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Large.args = {
  size: 'lg',
  variant: 'primary',
};

export const Medium = Template.bind({});
Medium.args = {
  size: 'md',
  variant: 'primary',
};

export const Small = Template.bind({});
Small.args = {
  size: 'sm',
  variant: 'primary',
};

export const isDisabled = Template.bind({});
isDisabled.args = {
  isDisabled: true,
  variant: 'primary',
};

export const isLoading = Template.bind({});
isLoading.args = {
  isLoading: 'true',
  loadingText: 'Loading...',
  variant: 'utility',
};

export const LargeSecondary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
LargeSecondary.args = {
  size: 'lg',
  variant: 'secondary',
};

export const MediumSecondary = Template.bind({});
MediumSecondary.args = {
  size: 'md',
  variant: 'secondary',
};

export const SmallSecondary = Template.bind({});
SmallSecondary.args = {
  size: 'sm',
  variant: 'secondary',
};

export const isDisabledSecondary = Template.bind({});
isDisabledSecondary.args = {
  isDisabled: 'true',
  variant: 'secondary',
};

export const isLoadingSecondary = Template.bind({});
isLoadingSecondary.args = {
  isLoading: 'true',
  loadingText: 'Loading...',
  variant: 'secondary',
};

export const SmallRightIcon = Template.bind({});
SmallRightIcon.args = {
  size: 'sm',
  variant: 'secondary',
  rightIcon: <ArrowRight className='!fill-current' />,
};

export const SmallLeftIcon = Template.bind({});
SmallLeftIcon.args = {
  size: 'sm',
  variant: 'secondary',
  leftIcon: <ArrowLeft className='!fill-current' />,
};

export const SmallLink = Template.bind({});
SmallLink.args = {
  size: 'sm',
  variant: 'link',
};
