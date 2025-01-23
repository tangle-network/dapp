import { Observable } from 'rxjs';
import {
  AssetBalanceMap,
  RestakeVaultAssetMap,
  AssetWithBalance,
} from '../../types/restake';

export type RestakeContextType = {
  /**
   * The asset map for the current selected chain
   */
  assetMetadataMap: RestakeVaultAssetMap;

  /**
   * An observable of the asset map for the current selected chain
   */
  assetMap$: Observable<RestakeVaultAssetMap>;

  /**
   * The balances of the current active account
   */
  balances: AssetBalanceMap;

  /**
   * An observable of the balances of the current active account
   */
  balances$: Observable<AssetBalanceMap>;

  /**
   * An observable of assets with balances of the current active account
   */
  assetWithBalances$: Observable<Array<AssetWithBalance>>;

  /**
   * The assets with balances of the current active account
   */
  assetWithBalances: Array<AssetWithBalance>;
};
