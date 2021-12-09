import { WebbNativeCurrencyId } from '@webb-dapp/apps/configs';

export interface ChainConfig {
  id: number;
  name: string;
  group: string;
  evmId: number | undefined;
  tag?: 'dev' | 'test' | 'live';
  url: string;
  evmRpcUrls?: string[];
  blockExplorerStub?: string;
  logo: React.ComponentType;
  nativeCurrencyId: WebbNativeCurrencyId;
  currencies: Array<{ currencyId: WebbNativeCurrencyId; enabled: boolean }>;
}
