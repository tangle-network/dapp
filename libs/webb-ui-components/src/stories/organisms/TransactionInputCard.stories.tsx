import type { Meta, StoryObj } from '@storybook/react';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { useState } from 'react';
import { TransactionInputCard } from '../../components/TransactionInputCard';

const meta: Meta<typeof TransactionInputCard> = {
  title: 'Design System/V2 (WIP)/Organisms/TransactionInputCard',
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof TransactionInputCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Default: Story = {
  render: () => (
    <TransactionInputCard.Root>
      <TransactionInputCard.Header>
        <TransactionInputCard.ChainSelector />
        <TransactionInputCard.MaxAmountButton />
      </TransactionInputCard.Header>

      <TransactionInputCard.Body />
    </TransactionInputCard.Root>
  ),
};

const FilledComponent = () => {
  const [value, setValue] = useState<string>('');
  const [isFixedAmount, setIsFixedAmount] = useState(false);

  return (
    <TransactionInputCard.Root
      typedChainId={PresetTypedChainId.PolygonTestnet}
      amount={value}
      onAmountChange={setValue}
      maxAmount={3.2}
      tokenSymbol="webbETH"
      isFixedAmount={isFixedAmount}
      onIsFixedAmountChange={setIsFixedAmount}
    >
      <TransactionInputCard.Header>
        <TransactionInputCard.ChainSelector />
        <TransactionInputCard.MaxAmountButton />
      </TransactionInputCard.Header>

      <TransactionInputCard.Body />

      <TransactionInputCard.Footer
        labelWithTooltipProps={{
          info: isFixedAmount ? 'Fixed amount' : 'Custom amount',
        }}
      />
    </TransactionInputCard.Root>
  );
};

export const Filled: Story = {
  render: () => <FilledComponent />,
};
