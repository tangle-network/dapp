import PolygonLogo from '@webb-dapp/apps/configs/logos/chains/PolygonLogo';
import { EthLogo } from '@webb-dapp/apps/configs/logos/chains';
import React from 'react';
import {
  TransactionPayload,
  TransactionQueueCard,
} from '@webb-dapp/webb-ui-components/containers/TransactionProgressCard';

export const dummyTransactions: TransactionPayload[] = [
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
    getExplorerURI(addOrTxHash: string, variant: 'tx' | 'address'): string {
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
    getExplorerURI(addOrTxHash: string, variant: 'tx' | 'address'): string {
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
    getExplorerURI(addOrTxHash: string, variant: 'tx' | 'address'): string {
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
    getExplorerURI(addOrTxHash: string, variant: 'tx' | 'address'): string {
      return '#';
    },
    nativeValue: '1230',
    onDetails: () => {},
    onDismiss: () => {},
  },
];

const TransactionProgressCardShowCase = () => {
  return <TransactionQueueCard onCollapseChange={() => {}} collapsed={false} transactions={dummyTransactions} />;
};

export default TransactionProgressCardShowCase;
