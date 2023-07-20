import { ChainConfig } from '@webb-tools/dapp-config';

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
  icon?: JSX.Element;
}

export type ActivityType = 'deposit' | 'transfer' | 'withdraw';

export interface ActivityCellProps {
  txHash: string;
  activity: ActivityType;
}

export interface TimeCellProps {
  time?: number;
  className?: string;
}

export interface DestinationCellProps {
  className?: string;
}

export interface FilterButtonProps {
  tokens: [string, string][];
  selectedTokens: [string, string][];
  setSelectedTokens: (tokens: [string, string][]) => void;
  sourceChains: string[];
  selectedSourceChains: [string, ChainConfig][];
  setSelectedSourceChains: (chains: [string, ChainConfig][]) => void;
  destinationChains: string[];
  selectedDestinationChains: [string, ChainConfig][];
  setSelectedDestinationChains: (chains: [string, ChainConfig][]) => void;
  showAllFn: () => void;
}
