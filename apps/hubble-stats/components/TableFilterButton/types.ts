export interface TableFilterButtonProps {
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
