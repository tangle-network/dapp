import type { Meta, StoryObj } from '@storybook/react';

import ExternalLinkIcon from '../../components/ExternalLinkIcon';
import { TANGLE_MKT_URL } from '../../constants';

const meta: Meta<typeof ExternalLinkIcon> = {
  title: 'Design System/Molecules/ExternalLinkIcon',
  component: ExternalLinkIcon,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof ExternalLinkIcon>;

export const Default: Story = {
  render: () => <ExternalLinkIcon href={TANGLE_MKT_URL} />,
};

export const Large: Story = {
  render: () => <ExternalLinkIcon href={TANGLE_MKT_URL} size="lg" />,
};

export const ExtraLarge: Story = {
  render: () => <ExternalLinkIcon href={TANGLE_MKT_URL} size="xl" />,
};
