import type { Meta, StoryObj } from '@storybook/react';

import OFACModal from '../../components/OFACModal';

const meta: Meta<typeof OFACModal> = {
  title: 'Design System/Molecules/OFACModal',
  component: OFACModal,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof OFACModal>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => <OFACModal />,
};
