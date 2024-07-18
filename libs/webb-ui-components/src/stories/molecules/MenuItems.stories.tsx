import type { Meta, StoryObj } from '@storybook/react';

import {
  Dropdown,
  DropdownButton,
  DropdownBody,
} from '../../components/Dropdown';
import { MenuItem } from '../../components/MenuItems';

const meta: Meta<typeof MenuItem> = {
  title: 'Design System/Molecules/MenuItems',
  component: MenuItem,
};

export default meta;

type Story = StoryObj<typeof MenuItem>;

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
            <MenuItem>{str}</MenuItem>
          ))}
        </ul>
      </DropdownBody>
    </Dropdown>
  ),
};
