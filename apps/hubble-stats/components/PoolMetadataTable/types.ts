export type PoolAttributeType = {
  name: string;
  detail?: string;
  externalLink?: string;
  isAddress?: boolean;
};

export interface PoolMetadataTableProps {
  data: PoolAttributeType[];
}
