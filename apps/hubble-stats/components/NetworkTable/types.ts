export type TokenCompositionType = {
  tokenName: string;
  tokenSymbol: string;
  tokenComposition: number;
  tokenAggregate: number;
  chainsData: Record<number, number | undefined>;
};

export interface NetworkTableProps {
  chains: number[];
  data: Array<TokenCompositionType>;
}
