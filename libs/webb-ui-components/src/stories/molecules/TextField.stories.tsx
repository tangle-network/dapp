import type { Meta, StoryObj } from '@storybook/react';
import { AccountCircleLineIcon, ClipboardLineIcon } from '@webb-tools/icons';
import { IconWithTooltip } from '../../components/IconWithTooltip';
import { TextField } from '../../components/TextField';

const meta: Meta<typeof TextField> = {
  title: 'Design System/V2 (WIP)/Molecules/TextField',
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof TextField>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => <TextField.Input placeholder="0x..." />,
};

export const Disabled: Story = {
  render: () => <TextField.Input isDisabled placeholder="0x..." />,
};

export const Error: Story = {
  render: () => <TextField.Input placeholder="0x..." error="Error message" />,
};

export const WithIcons: Story = {
  render: () => (
    <TextField.Root>
      <TextField.Input placeholder="0x..." />

      <TextField.Slot>
        <IconWithTooltip
          icon={<ClipboardLineIcon size="lg" className="!fill-current" />}
          content="From clipboard"
          overrideTooltipTriggerProps={{ className: 'cursor-pointer' }}
        />
        <IconWithTooltip
          icon={<AccountCircleLineIcon size="lg" className="!fill-current" />}
          content="Use my account"
          overrideTooltipTriggerProps={{ className: 'cursor-pointer' }}
        />
      </TextField.Slot>
    </TextField.Root>
  ),
};
