import {
  AssetBalanceMap,
  AssetMap,
  AssetWithBalance,
} from '@webb-tools/tangle-shared-ui/types/restake';
import { Observable } from 'rxjs';

export type RestakeContextType = {
  /**
   * The asset map for the current selected chain
   */
  assetMap: AssetMap;

  /**
   * An observable of the asset map for the current selected chain
   */
  assetMap$: Observable<AssetMap>;

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
