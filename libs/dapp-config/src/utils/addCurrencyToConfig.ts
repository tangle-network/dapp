import { CurrencyRole, CurrencyType } from '@webb-tools/dapp-types';
import { CurrencyConfig } from '../currencies/currency-config.interface';
import { ICurrency } from '../on-chain-config';

const addCurrencyToConfig = (
  config: Record<number, CurrencyConfig>,
  currencyToAdd: ICurrency,
  typedChainId: number,
  role: CurrencyRole,
  type: CurrencyType
): CurrencyConfig => {
  let currencyConfig = Object.values(config).find(
    (c) => c.name === currencyToAdd.name && c.symbol === currencyToAdd.symbol
  );

  if (currencyConfig) {
    if (
      currencyConfig.addresses.has(typedChainId) &&
      currencyConfig.addresses.get(typedChainId) !== currencyToAdd.address
    ) {
      throw new Error(
        `The currency ${currencyToAdd.symbol} already exists in the config with different address`
      );
    }

    currencyConfig.addresses.set(typedChainId, currencyToAdd.address);
  } else {
    const nextId = Object.keys(config).length;

    currencyConfig = {
      id: nextId,
      name: currencyToAdd.name,
      symbol: currencyToAdd.symbol,
      decimals: currencyToAdd.decimals,
      type,
      role,
      addresses: new Map([[typedChainId, currencyToAdd.address]]),
    } satisfies CurrencyConfig;

    config[nextId] = currencyConfig;
  }

  return currencyConfig;
};

export default addCurrencyToConfig;
