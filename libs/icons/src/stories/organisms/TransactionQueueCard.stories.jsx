import React from 'react';

import { KeyCard } from '@webb-dapp/webb-ui-components/components';
import { TransactionQueueCard } from '@webb-dapp/webb-ui-components/containers/TransactionProgressCard';
import PolygonLogo from '@webb-dapp/apps/src/configs/logos/chains/PolygonLogo';
import { EthLogo } from '@webb-dapp/apps/src/configs/logos/chains';

export default {
  title: 'Design System/Organisms/TransactionQueueCard',
  component: TransactionQueueCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <TransactionQueueCard {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  title: 'Empty Queue',
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
      wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
      timestamp: new Date(),
      getExplorerURI(addOrTxHash, variant) {
        return '#';
      },
      nativeValue: '1230',
      onDetails: () => {},
      onDismiss: () => {},
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
      id: '123fA',
      wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
      timestamp: new Date(),
      getExplorerURI(addOrTxHash, variant) {
        return '#';
      },
      nativeValue: '1230',
      onDetails: () => {},
      onDismiss: () => {},
      onSyncNote: () => {},
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
      wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
      timestamp: new Date(),
      getExplorerURI(addOrTxHash, variant) {
        return '#';
      },
      nativeValue: '1230',
      onDetails: () => {},
      onDismiss: () => {},
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
      wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
      timestamp: new Date(),
      getExplorerURI(addOrTxHash, variant) {
        return '#';
      },
      nativeValue: '1230',
      onDetails: () => {},
      onDismiss: () => {},
      onSyncNote: () => {},
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
      id: '123fA',
      wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
      timestamp: new Date(),
      getExplorerURI(addOrTxHash, variant) {
        return '#';
      },
      nativeValue: '1230',
      onDetails: () => {},
      onDismiss: () => {},
      onSyncNote: () => {},
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
      id: '123f2',
      wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
      timestamp: new Date(),
      getExplorerURI(addOrTxHash, variant) {
        return '#';
      },
      nativeValue: '1230',
      onDetails: () => {},
      onDismiss: () => {},
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
      id: '123f2',
      wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
      timestamp: new Date(),
      getExplorerURI(addOrTxHash, variant) {
        return '#';
      },
      nativeValue: '1230',
      onDetails: () => {},
      onDismiss: () => {},
    },
  ],
};
