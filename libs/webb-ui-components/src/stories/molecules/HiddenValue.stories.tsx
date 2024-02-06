import {
  HiddenValue,
  HiddenValueEye,
} from '@webb-tools/webb-ui-components/components';
import { Meta, StoryFn } from '@storybook/react';
import { HiddenValueProps } from '../../components/HiddenValue/types';

export default {
  title: 'Design System/Molecules/HiddenValue',
  component: HiddenValue,
} satisfies Meta;

const Template: StoryFn<HiddenValueProps> = (args) => {
  return (
    <>
      <HiddenValue {...args} />
      <HiddenValueEye />
    </>
  );
};

export const Default = Template.bind({});

Default.args = {
  children: '0x123456789012345678',
};
