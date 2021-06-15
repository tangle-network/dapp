import { WebbCurrencyId } from './currency';

export interface ChainConfig {
  id: number;
  name: string;
  group: string;
  tag?: 'dev' | 'test' | 'live';
  url: string;
  logo: React.ComponentType;
  nativeCurrencyId: WebbCurrencyId;
  currencies: Array<{ currencyId: WebbCurrencyId; enabled: boolean }>;
}
