import type { TransactionType } from '@webb-tools/abstract-api-provider';
import { Note } from '@webb-tools/sdk-core';

export interface TxBasicInfoProps
  extends Pick<
    TransactionType,
    | 'hash'
    | 'amount'
    | 'recipientAddress'
    | 'fungibleTokenSymbol'
    | 'wrapTokenSymbol'
    | 'unwrapTokenSymbol'
    | 'relayerUri'
    | 'relayerName'
    | 'relayerFeesAmount'
    | 'refundAmount'
    | 'refundRecipientAddress'
    | 'refundTokenSymbol'
    | 'timestamp'
    | 'destinationTypedChainId'
  > {}

export interface SourceOrDestinationWalletInfoProps
  extends Pick<
    TransactionType,
    'amount' | 'fungibleTokenSymbol' | 'wrapTokenSymbol' | 'unwrapTokenSymbol'
  > {
  type: 'source' | 'destination';
  typedChainId: number;
  walletAddress: string;
}

export interface InputOrOutputNotesProps
  extends Pick<TransactionType, 'activity' | 'fungibleTokenSymbol'> {
  type: 'input' | 'output';
  notes: Note[];
  typedChainId: number;
  noteAccountAddress: string;
}
