// @ts-ignore
import { CurrencyId } from '@webb-tools/protocol-substrate-types/interfaces';

export const isSupportedCurrency = (currency: CurrencyId): boolean => {
  // @ts-ignore
  return currency.toHuman()?.Token == 'EDG';
};
