export type NetworkPoolType = {
  poolName: string;
  poolSymbol: string;
  poolAggregate: number;
  chainsData: Record<number, number | undefined>;
  prefixUnit?: string;
};

export interface NetworkPoolTableProps {
  chains: number[];
  data: Array<NetworkPoolType>;
}
