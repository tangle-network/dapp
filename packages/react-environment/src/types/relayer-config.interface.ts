export interface RelayerConfig {
  id: number;
  name: string;
  endpoint: string;
  fee: number;
  address: string;

  // TODO implement this method to query for fee and relayer address:
  getParameters(): {fee: number, address: string} | null;

  supportedChainIds: number[];
}