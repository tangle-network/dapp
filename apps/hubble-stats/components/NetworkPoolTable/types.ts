export type NetworkPoolType = {
  poolName: string;
  poolSymbol: string;
  poolAggregate: number;
  chainsData: Record<number, number | undefined>;
};

export interface NetworkPoolTableProps {
  chains: number[];
  data: Array<NetworkPoolType>;
}
