import { Note } from '@webb-tools/sdk-core';

export interface TxDetailContainerProps {
  hash: string;
  activity: 'deposit' | 'transfer' | 'withdraw';
  amount: number;
  noteAccountAddress: string;
  walletAddress?: string;
  fungibleTokenSymbol: string;
  wrappableTokenSymbol?: string;
  timestamp: number;
  relayerName?: string;
  relayerFeeAmount?: string | number;
  inputNoteSerializations?: string[];
  outputNoteSerializations?: string[];
}

export interface TxBasicInfoProps
  extends Pick<
    TxDetailContainerProps,
    | 'hash'
    | 'amount'
    | 'fungibleTokenSymbol'
    | 'wrappableTokenSymbol'
    | 'relayerName'
    | 'relayerFeeAmount'
    | 'timestamp'
  > {}

export interface SourceOrDestinationWalletInfoProps
  extends Pick<
    TxDetailContainerProps,
    'walletAddress' | 'amount' | 'fungibleTokenSymbol' | 'wrappableTokenSymbol'
  > {
  type: 'source' | 'destination';
  typedChainId: number;
}

export interface InputOrOutputNotesProps
  extends Pick<
    TxDetailContainerProps,
    'activity' | 'noteAccountAddress' | 'fungibleTokenSymbol'
  > {
  type: 'input' | 'output';
  notes: Note[];
  typedChainId: number;
}
