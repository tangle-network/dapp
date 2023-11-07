export interface TxBasicInfoProps {
  amount: string;
  tokenSymbol: string;
  txHash: string;
  timestamp: number;
  relayerInfo?: {
    name: string;
    amount: string;
    tokenSymbol: string;
  };
}

export interface SourceOrDestinationWalletInfoProps {
  type: 'source' | 'destination';
  typedChainId: number;
  walletAddress: string;
  amount: string;
  tokenSymbol: string;
}

export interface InputOrOutputNotesProps {
  activity: 'deposit' | 'transfer' | 'withdraw';
  type: 'input' | 'output';
  typedChainId: number;
  tokenSymbol: string;
  accAddress: string;
  notes: {
    serialization: string;
    amount: string;
  }[];
}
