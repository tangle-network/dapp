import { TokenIcon } from '@webb-tools/icons';
import { TransactionQueueCard } from '../../containers/TransactionProgressCard';
import noop from 'lodash/noop';

export default {
  title: 'Design System/templates/TransactionQueueCard',
  component: TransactionQueueCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <TransactionQueueCard {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  transactions: [],
};

export const WithInProgressTransaction = Template.bind({});

WithInProgressTransaction.args = {
  transactions: [
    {
      method: 'Transfer',
      txStatus: {
        status: 'in-progress',
        recipient: '0xasdfj2r3092430u',
        txHash: '0xasdfj2r3092430u',
      },
      tokens: ['USDC', 'ETH'],
      token: 'ETH',
      amount: '0.999',
      id: '123f2',
      wallets: {
        src: <TokenIcon name={'ETH'} />,
        dist: <TokenIcon name={'ETH'} />,
      },
      timestamp: new Date(),
      getExplorerURI() {
        return '#';
      },
      nativeValue: '1230',
      onDetails: noop,
      onDismiss: noop,
    },
  ],
};

export const WithSuccessTransaction = Template.bind({});

WithSuccessTransaction.args = {
  transactions: [
    {
      method: 'Withdraw',
      txStatus: {
        status: 'completed',
        recipient: '0xasdfj2r3092430u',
        txHash: '0xasdfj2r3092430u',
      },
      tokens: ['USDT', 'ETH'],
      token: 'ETH',
      amount: '0.9995',
      id: 'sdfjwo',
      wallets: {
        src: <TokenIcon name={'ETH'} />,
        dist: <TokenIcon name={'ETH'} />,
      },
      timestamp: new Date(),
      getExplorerURI() {
        return '#';
      },
      nativeValue: '1230',
      onDetails: noop,
      onDismiss: noop,
      onSyncNote: noop,
    },
  ],
};
export const WithFailedTransaction = Template.bind({});
WithFailedTransaction.args = {
  transactions: [
    {
      method: 'Withdraw',
      txStatus: {
        status: 'warning',
        message: 'Generating ZK  proofs..',
        recipient: '0xasdfj2r3092430u',
        txHash: '0xasdfj2r3092430u',
      },
      tokens: ['ETH'],
      token: 'ETH',
      amount: '0.999',
      id: '123f2',
      wallets: {
        src: <TokenIcon name={'ETH'} />,
        dist: <TokenIcon name={'ETH'} />,
      },
      timestamp: new Date(),
      getExplorerURI() {
        return '#';
      },
      nativeValue: '1230',
      onDetails: noop,
      onDismiss: noop,
    },
  ],
};

export const WithInAllTransaction = Template.bind({});
WithInAllTransaction.args = {
  transactions: [
    {
      method: 'Withdraw',
      txStatus: {
        status: 'in-progress',
        message: 'Generating ZK  proofs..',
        recipient: '0xasdfj2r3092430u',
        txHash: '0xasdfj2r3092430u',
      },
      tokens: ['USDC', 'ETH'],
      token: 'ETH',
      amount: '0.999',
      id: '123f',
      wallets: {
        src: <TokenIcon name={'ETH'} />,
        dist: <TokenIcon name={'ETH'} />,
      },
      timestamp: new Date(),
      getExplorerURI() {
        return '#';
      },
      nativeValue: '1230SZ',
      onDetails: noop,
      onDismiss: noop,
      onSyncNote: noop,
    },
    {
      method: 'Withdraw',
      txStatus: {
        status: 'completed',
        recipient: '0xasdfj2r3092430u',
        txHash: '0xasdfj2r3092430u',
      },
      tokens: ['USDT', 'ETH'],
      token: 'ETH',
      amount: '0.9995',
      id: '123f23dA',
      wallets: {
        src: <TokenIcon name={'ETH'} />,
        dist: <TokenIcon name={'ETH'} />,
      },
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      getExplorerURI() {
        return '#';
      },
      nativeValue: '1230',
      onDetails: noop,
      onDismiss: noop,
      onSyncNote: noop,
    },
    {
      method: 'Withdraw',
      txStatus: {
        status: 'warning',
        message: 'Generating ZK  proofs..',
        recipient: '0xasdfj2r3092430u',
        txHash: '0xasdfj2r3092430u',
      },
      tokens: ['ETH'],
      token: 'ETH',
      amount: '0.999',
      id: '123f2lo',
      wallets: {
        src: <TokenIcon name={'ETH'} />,
        dist: <TokenIcon name={'ETH'} />,
      },
      timestamp: new Date(Date.now() - 60 * 1000),
      getExplorerURI() {
        return '#';
      },
      nativeValue: '1230',
      onDetails: noop,
      onDismiss: noop,
    },
    {
      method: 'Transfer',
      txStatus: {
        status: 'in-progress',
        recipient: '0xasdfj2r3092430u',
        txHash: '0xasdfj2r3092430u',
      },
      tokens: ['USDC', 'ETH'],
      token: 'ETH',
      amount: '0.999',
      id: '123f2op0',
      wallets: {
        src: <TokenIcon name={'ETH'} />,
        dist: <TokenIcon name={'ETH'} />,
      },
      timestamp: new Date(),
      getExplorerURI() {
        return '#';
      },
      nativeValue: '1230',
      onDetails: noop,
      onDismiss: noop,
    },
  ],
};
