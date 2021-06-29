import { WebbCurrencyId } from '@webb-dapp/apps/configs/wallets/webb-currency-id.enum';

export interface ChainConfig {
  id: number;
  name: string;
  group: string;
  evmId: number | undefined;
  tag?: 'dev' | 'test' | 'live';
  url: string;
  logo: React.ComponentType;
  nativeCurrencyId: WebbCurrencyId;
  currencies: Array<{ currencyId: WebbCurrencyId; enabled: boolean }>;
}
