import type { Meta, StoryObj } from '@storybook/react';

import TokenSelector from '../../components/TokenSelector';

const meta: Meta<typeof TokenSelector> = {
  title: 'Design System/V2 (WIP)/Molecules/TokenSelector',
  component: TokenSelector,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof TokenSelector>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => <TokenSelector />,
};
