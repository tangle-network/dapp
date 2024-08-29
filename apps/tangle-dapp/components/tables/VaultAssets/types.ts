export type VaultAssetData = {
  id: string;
  symbol: string;
  tvl: number;
  selfStake: number;
};

export type Props = {
  isShown?: boolean;
  data?: VaultAssetData[];
};
