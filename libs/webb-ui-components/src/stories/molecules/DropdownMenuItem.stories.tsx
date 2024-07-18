import type { Meta, StoryObj } from '@storybook/react';

import {
  Dropdown,
  DropdownButton,
  DropdownBody,
  DropdownMenuItem,
} from '../../components/Dropdown';

const meta: Meta<typeof DropdownMenuItem> = {
  title: 'Design System/Molecules/DropdownMenuItem',
  component: DropdownMenuItem,
};

export default meta;

type Story = StoryObj<typeof DropdownMenuItem>;

export const Default: Story = {
  render: () => (
    <Dropdown className="w-full">
      <DropdownButton
        size="sm"
        className="w-full px-4 py-4 rounded-full"
        label="hello"
      />

      <DropdownBody className="radix-side-top:mb-2 radix-side-bottom:mt-2 w-[var(--radix-dropdown-menu-trigger-width)]">
        <ul>
          {['abc', 'xyz'].map((str) => (
            <DropdownMenuItem>{str}</DropdownMenuItem>
          ))}
        </ul>
      </DropdownBody>
    </Dropdown>
  ),
};
