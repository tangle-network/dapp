export type VaultAssetData = {
  id: string;
  symbol: string;
  decimals: number;
  tvl: number | null;
  selfStake: bigint;
};

export type Props = {
  isShown?: boolean;
  data?: VaultAssetData[];
};
