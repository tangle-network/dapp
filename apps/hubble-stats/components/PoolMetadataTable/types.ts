export type ExplorerUrls = Record<number, string>;
export type WrappingFeesByChain = Record<number, number>;

export type PoolAttributeType = {
  name: string;
  detail?: string;
  externalLink?: string;
  isAddress?: boolean;
};

export interface PoolMetadataTableProps {
  data: PoolAttributeType[];
}
