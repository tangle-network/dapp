export type WrappingFeesByChainType = Record<number, number | undefined>;
export type ExplorerUrlsByChainType = Record<number, string>;

export type AddressWithExplorerUrlsType = {
  address: string;
  urls: ExplorerUrlsByChainType;
};

export type PoolAttributeType = {
  name: string;
  detail?: string | AddressWithExplorerUrlsType | WrappingFeesByChainType;
  externalLink?: string;
  isAddress?: boolean;
};

export interface PoolMetadataTableProps {
  data: PoolAttributeType[];
}
