import { ChainType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import { Chain } from '@webb-tools/dapp-config';
import { currenciesConfig } from '@webb-tools/dapp-config';
import {
  calculateTypedChainId,
  ChainType as ChainTypeEnum,
} from '@webb-tools/sdk-core';
import { EVMChainId } from '@webb-tools/dapp-types';

// Default connection is ETH Goerli
export const getDefaultConnection = (chains: Record<number, Chain>) => {
  const sourceChains: ChainType[] = Object.values(chains).map((val) => {
    return {
      name: val.name,
      symbol: currenciesConfig[val.nativeCurrencyId].symbol,
    };
  });

  const defaultTypedChainId = calculateTypedChainId(
    ChainTypeEnum.EVM,
    EVMChainId.Goerli
  );

  const defaultChain = chains[defaultTypedChainId];

  return {
    defaultChain,
    sourceChains,
  };
};
