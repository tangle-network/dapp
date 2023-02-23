import { CurrencyType } from '@webb-tools/dapp-types';
import { CurrencyConfig } from '../currencies';

/**
 * Returns the native currency config for the given chain id
 * @param config the currency config
 * @param typedChainId the typed chain id
 * @returns the native currency config for the given chain id
 */
export const getNativeCurrencyFromConfig = (
  config: Record<number, CurrencyConfig>,
  typedChainId: number
): CurrencyConfig | undefined => {
  return Object.values(config)
    .filter((currency) => {
      return currency.type === CurrencyType.NATIVE;
    })
    .find((currency) => {
      return Array.from(currency.addresses.keys()).find(
        (currentTypedChainId) => {
          return currentTypedChainId === typedChainId;
        }
      );
    });
};
