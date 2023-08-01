import type { Meta, StoryObj } from '@storybook/react';
import LoadingPill from '../../components/buttons/LoadingPill';

const meta: Meta<typeof LoadingPill> = {
  title: 'Design System/V2 (WIP)/Molecules/LoadingPill',
  component: LoadingPill,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof LoadingPill>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => <LoadingPill />,
};

export const Success: Story = {
  render: () => <LoadingPill status="success" />,
};

export const Error: Story = {
  render: () => <LoadingPill status="error" />,
};
