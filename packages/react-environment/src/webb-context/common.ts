import { ChainId, currenciesConfig, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { AnchorConfigEntry } from '@webb-dapp/react-environment/types/anchor-config.interface';
import { BridgeConfig } from '@webb-dapp/react-environment/types/bridge-config.interface';
import { ChainConfig } from '@webb-dapp/react-environment/types/chain-config.interface';
import { CurrencyConfig } from '@webb-dapp/react-environment/types/currency-config.interface';
import { MixerConfig } from '@webb-dapp/react-environment/types/mixer-config.interface';
import { WalletConfig } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { LoggerService } from '@webb-tools/app-util';
import { BehaviorSubject, map, Observable } from 'rxjs';

const logger = LoggerService.get('config api');

export type Chain = ChainConfig & {
  wallets: Record<number, Wallet>;
};
export type Wallet = WalletConfig & {};

export type AppConfig = {
  wallet: Record<number, WalletConfig>;
  chains: Record<number, ChainConfig>;
  currencies: Record<number, CurrencyConfig>;
  bridgeByAsset: Record<number, BridgeConfig>;
  anchors: Record<number, AnchorConfigEntry[]>;
  mixers: Record<number, MixerConfig>;
};
/*
 * Base configuration class with the utils
 *
 * */
abstract class AppConfigBase {
  abstract get config(): AppConfig;

  public getAnchorAddressForBridge(assetId: WebbCurrencyId, chainId: number, amount: number): string | undefined {
    const linkedAnchorConfig = this.config.bridgeByAsset[assetId]?.anchors.find(
      (anchor) => anchor.amount === amount.toString()
    );
    if (!linkedAnchorConfig) {
      throw new Error('Unsupported configuration for bridge');
    }

    const anchorAddress = linkedAnchorConfig.anchorAddresses[chainId as ChainId];
    logger.log('got anchor address: ', anchorAddress);
    return anchorAddress;
  }

  public getNativeCurrencySymbol(evmId: number): string {
    const chain = Object.values(this.config.chains).find((chainsConfig) => chainsConfig.evmId === evmId);
    if (chain) {
      const nativeCurrency = chain.nativeCurrencyId;
      return currenciesConfig[nativeCurrency].symbol;
    }
    return 'Unknown';
  }

  public getEVMChainName(evmId: number): string {
    const chain = Object.values(this.config.chains).find((chainsConfig) => chainsConfig.evmId === evmId);
    if (chain) {
      return chain.name;
    } else {
      throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }
  }

  public getEVMChainNameFromInternal(chainID: number): string {
    const chain = Object.values(this.config.chains).find((chainsConfig) => chainsConfig.id === chainID);
    if (chain) {
      return chain.name;
    } else {
      throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }
  }
}

/*
 * Enhanced version of `AppConfig`
 * this will be for reading/ maping purposes

 * */
export class EnhancedAppConfig extends AppConfigBase {
  constructor(public config: AppConfig) {
    super();
  }
}

/**
 *
 * */
export class AppConfigApi extends AppConfigBase {
  private readonly _appConfig: BehaviorSubject<AppConfig>;

  constructor(staticConfig: AppConfig) {
    super();
    this._appConfig = new BehaviorSubject({ ...staticConfig });
  }

  get $config(): Observable<EnhancedAppConfig> {
    return this._appConfig.asObservable().pipe(map((config) => new EnhancedAppConfig(config)));
  }

  get config(): AppConfig {
    return {
      ...this._appConfig.value,
    };
  }

  set config(partialConfig: Partial<AppConfig>) {
    const nextConfig = {
      ...this.config,
      ...partialConfig,
    };
    this._appConfig.next(nextConfig);
  }
}
