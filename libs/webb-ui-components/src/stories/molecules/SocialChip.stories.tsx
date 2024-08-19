import type { Meta, StoryObj } from '@storybook/react';

import { SocialChip } from '../../components/SocialChip';

const meta: Meta<typeof SocialChip> = {
  title: 'Design System/Molecules/SocialChip',
  component: SocialChip,
};

export default meta;

type Story = StoryObj<typeof SocialChip>;

export const Website: Story = {
  render: () => (
    <SocialChip
      title="View website"
      href="https://tangle.tools/"
      type="website"
    />
  ),
};

export const Discord: Story = {
  render: () => (
    <SocialChip href="https://discord.com/invite/cv8EfJu3Tn" type="discord" />
  ),
};

export const Twitter: Story = {
  render: () => (
    <SocialChip href="https://twitter.com/tangle_network" type="twitter" />
  ),
};

export const Github: Story = {
  render: () => (
    <SocialChip href="https://github.com/webb-tools/tangle" type="github" />
  ),
};

export const Email: Story = {
  render: () => <SocialChip href="mailto:drew@webb.tools" type="email" />,
};
