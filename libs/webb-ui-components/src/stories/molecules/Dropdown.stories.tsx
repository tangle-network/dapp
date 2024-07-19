import type { Meta, StoryObj } from '@storybook/react';

import {
  AccountDropdownBody,
  Dropdown,
  DropdownButton,
  DropdownBody,
  DropdownMenu as DropdownCmp,
  DropdownMenuItem,
} from '../../components/Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Design System/Molecules/Dropdown',
  component: Dropdown,
};

export default meta;

type Story = StoryObj<typeof DropdownMenuItem>;

export const Default: Story = {
  render: () => (
    <Dropdown className="w-full">
      <DropdownButton size="sm" className="w-full px-4 py-4" label="Click Me" />

      <DropdownBody className="radix-side-top:mb-2 radix-side-bottom:mt-2 w-[var(--radix-dropdown-menu-trigger-width)]">
        <ul>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
        </ul>
      </DropdownBody>
    </Dropdown>
  ),
};

export const DropdownMenu: Story = {
  render: () => (
    <DropdownCmp
      className="mr-3"
      size="sm"
      label="Chain"
      menuOptions={[{ value: 'Day' }, { value: 'Week' }, { value: 'Year' }]}
      value="Ethereum"
    />
  ),
};

export const AccountDropdown: Story = {
  render: () => (
    <Dropdown className="w-full">
      <DropdownButton size="sm" className="w-full px-4 py-4" label="Click Me" />

      <AccountDropdownBody
        accountItems={[
          {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            name: 'Account 1',
            onClick: () => {
              return;
            },
          },
          {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            name: 'Account 2',
            onClick: () => {
              return;
            },
          },
        ]}
      />
    </Dropdown>
  ),
};
