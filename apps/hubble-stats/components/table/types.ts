export interface HeaderCellProps {
  title: string;
  tooltip?: string;
  className?: string;
}

export interface NumberCellProps {
  value?: number;
  prefix?: string;
  suffix?: string;
  isProtected?: boolean;
  className?: string;
}

export interface ShieldedCellProps {
  title: string;
  address: string;
  poolAddress: string;
}

export type ActivityType = 'deposit' | 'transfer' | 'withdraw';

export interface ActivityCellProps {
  txHash: string;
  activity: ActivityType;
  sourceTypedChainId: number;
}

export interface TimeCellProps {
  time?: string;
  className?: string;
}

export interface DestinationCellProps {
  className?: string;
}

export interface FilterButtonProps {
  tokens: [number, string][];
  selectedTokens: [number, string][];
  setSelectedTokens: (tokens: [number, string][]) => void;
  sourceChains: number[];
  selectedSourceChains: number[];
  setSelectedSourceChains: (chains: number[]) => void;
  destinationChains: number[];
  selectedDestinationChains: number[];
  setSelectedDestinationChains: (chains: number[]) => void;
  showAllFn: () => void;
}
