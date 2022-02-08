import { ChainType, WebbCurrencyId } from '@webb-dapp/apps/configs';

export interface ChainConfig {
  id: number;
  chainType: ChainType;
  name: string;
  group: string;
  evmId: number | undefined;
  tag?: 'dev' | 'test' | 'live';
  url: string;
  evmRpcUrls?: string[];
  blockExplorerStub?: string;
  logo: React.ComponentType;
  nativeCurrencyId: WebbCurrencyId;
  currencies: Array<WebbCurrencyId>;
}
