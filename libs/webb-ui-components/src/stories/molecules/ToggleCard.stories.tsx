import type { Meta, StoryObj } from '@storybook/react';

import ToggleCard from '../../components/ToggleCard';
import GasStationFill from '@webb-tools/icons/GasStationFill';

const meta: Meta<typeof ToggleCard> = {
  title: 'Design System/Molecules/ToggleCard',
  component: ToggleCard,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof ToggleCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => <ToggleCard title="Title" />,
};

export const WithIconAndDescription: Story = {
  render: () => (
    <ToggleCard
      title="Title"
      description="Description"
      info="Information"
      Icon={<GasStationFill size="lg" />}
    />
  ),
};
