import type { Meta, StoryObj } from '@storybook/react';
import { TxProgressor } from '../../components/TxProgressor';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { randEthereumAddress } from '@ngneat/falso';
import Decimal from 'decimal.js';

const meta: Meta<typeof TxProgressor> = {
  title: 'Design System/Molecules/TxProgressor',
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

type Story = StoryObj<typeof TxProgressor>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
export const Deposit: Story = {
  render: () => (
    <TxProgressor.Root>
      <TxProgressor.Header name="Deposit" createdAt={Date.now()} />
      <TxProgressor.Body
        txSourceInfo={{
          typedChainId: PresetTypedChainId.Goerli,
          amount: new Decimal(-1.45),
          tokenSymbol: 'WETH',
          walletAddress: randEthereumAddress(),
        }}
        txDestinationInfo={{
          typedChainId: PresetTypedChainId.PolygonTestnet,
          amount: new Decimal(1.45),
          tokenSymbol: 'webbETH',
          tokenType: 'shielded',
          accountType: 'note',
          walletAddress: randEthereumAddress(),
        }}
      />
      <TxProgressor.Footer
        status="info"
        statusMessage="Fetching Leaves (15%)"
        steppedProgressProps={{
          steps: 8,
          activeStep: 3,
        }}
        externalUrl={new URL('https://webb.tools')}
      />
    </TxProgressor.Root>
  ),
};

export const Withdraw: Story = {
  render: () => (
    <TxProgressor.Root>
      <TxProgressor.Header name="Withdraw" createdAt={Date.now()} />
      <TxProgressor.Body
        txSourceInfo={{
          typedChainId: PresetTypedChainId.Goerli,
          amount: new Decimal(-1),
          tokenSymbol: 'webbETH',
          tokenType: 'shielded',
          accountType: 'note',
          walletAddress: randEthereumAddress(),
        }}
        txDestinationInfo={{
          typedChainId: PresetTypedChainId.PolygonTestnet,
          amount: new Decimal(0.96),
          tokenSymbol: 'ETH',
          walletAddress: randEthereumAddress(),
        }}
      />
      <TxProgressor.Footer
        status="warning"
        statusMessage="Connection issue (0%)"
        steppedProgressProps={{
          steps: 8,
        }}
        externalUrl={new URL('https://webb.tools')}
      />
    </TxProgressor.Root>
  ),
};

export const Transfer: Story = {
  render: () => (
    <TxProgressor.Root>
      <TxProgressor.Header name="Transfer" createdAt={Date.now()} />
      <TxProgressor.Body
        txSourceInfo={{
          typedChainId: PresetTypedChainId.Goerli,
          amount: new Decimal(-1),
          tokenSymbol: 'webbETH',
          tokenType: 'shielded',
          accountType: 'note',
          walletAddress: randEthereumAddress(),
        }}
        txDestinationInfo={{
          typedChainId: PresetTypedChainId.PolygonTestnet,
          amount: new Decimal(1),
          tokenSymbol: 'webbETH',
          tokenType: 'shielded',
          accountType: 'note',
          walletAddress: randEthereumAddress(),
        }}
      />
      <TxProgressor.Footer
        status="error"
        statusMessage="Transaciton Failed"
        steppedProgressProps={{
          steps: 8,
          activeStep: 9,
        }}
        externalUrl={new URL('https://webb.tools')}
      />
    </TxProgressor.Root>
  ),
};
