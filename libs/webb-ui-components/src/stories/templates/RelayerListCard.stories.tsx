import type { Meta, StoryObj } from '@storybook/react';
import RelayerListCard from '../../components/ListCard/RelayerListCard';
import { randBoolean, randEthereumAddress, randNumber } from '@ngneat/falso';

const meta: Meta<typeof RelayerListCard> = {
  title: 'Design System/Templates/RelayerListCard',
  component: RelayerListCard,
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof RelayerListCard>;

const addresses = Array.from(
  new Set(
    Array.from({ length: randNumber({ min: 10, max: 20 }) }).map(() =>
      randEthereumAddress(),
    ),
  ),
);

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <RelayerListCard
      relayers={addresses.map((address) => ({
        address,
        externalUrl: 'https://webb.tools',
        percentage: randNumber({ min: 0, max: 10 }),
        theme: 'ethereum',
        isDisabled: randBoolean(),
      }))}
    />
  ),
};

export const Disconnected: Story = {
  render: () => (
    <RelayerListCard
      isDisconnected
      relayers={addresses.map((address) => ({
        address,
        externalUrl: 'https://webb.tools',
        percentage: randNumber({ min: 0, max: 10 }),
        theme: 'ethereum',
      }))}
    />
  ),
};
