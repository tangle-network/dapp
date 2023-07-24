export type NetworkTokenType = {
  symbol: string;
  compositionPercentage?: number;
  aggregate: number;
  chainsData: Record<number, number | undefined>;
  prefixUnit?: string;
  tokens?: Array<NetworkTokenType>;
};

export interface NetworkTokenTableProps {
  chains: number[];
  data: Array<NetworkTokenType>;
}
