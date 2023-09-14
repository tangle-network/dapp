export type WrappingFeesByChainType = Record<number, number | undefined>;
export type ExplorerUrlsByChainType = Record<number, string | undefined>;

export type AddressWithExplorerUrlsType = {
  address: string;
  urls: ExplorerUrlsByChainType;
};

export type PoolAttributeType = {
  name: string;
  detail?: string | AddressWithExplorerUrlsType | WrappingFeesByChainType;
};

export interface PoolMetadataTableProps {
  data: PoolAttributeType[];
}
