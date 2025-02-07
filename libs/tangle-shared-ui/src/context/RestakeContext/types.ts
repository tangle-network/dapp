import {
  AssetBalanceMap,
  AssetWithBalance,
  RestakeAssetMap,
} from '../../types/restake';

export type RestakeContextType = {
  /**
   * The asset map for the current selected chain
   */
  assets: RestakeAssetMap;

  /**
   * The balances of the current active account
   */
  balances: AssetBalanceMap;

  /**
   * The assets with balances of the current active account
   */
  assetWithBalances: AssetWithBalance;

  refetchErc20Balances: () => Promise<void>;

  isLoading: boolean;

  error: Error | null;
};
