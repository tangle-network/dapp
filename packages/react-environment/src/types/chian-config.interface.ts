import { WebbCurrencyId } from '@webb-dapp/apps/configs';

export interface ChainConfig {
  id: number;
  name: string;
  group: string;
  evmId: number | undefined;
  tag?: 'dev' | 'test' | 'live';
  url: string;
  evmRpcUrls?: string[];
  logo: React.ComponentType;
  nativeCurrencyId: WebbCurrencyId;
  currencies: Array<{ currencyId: WebbCurrencyId; enabled: boolean }>;
}
