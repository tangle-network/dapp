import type { Meta, StoryObj } from '@storybook/react';

import StatusIndicator from '../../components/StatusIndicator';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Design System/V2 (WIP)/Atoms/StatusIndicator',
  component: StatusIndicator,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof StatusIndicator>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => <StatusIndicator />,
};

export const Info: Story = {
  render: () => <StatusIndicator variant="info" />,
};

export const Warning: Story = {
  render: () => <StatusIndicator variant="warning" />,
};

export const Error: Story = {
  render: () => <StatusIndicator variant="error" />,
};

export const Success: Story = {
  render: () => <StatusIndicator variant="success" />,
};

export const CustomSize: Story = {
  render: () => <StatusIndicator size={24} />,
};
