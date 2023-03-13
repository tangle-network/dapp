import { Chain } from '@webb-tools/dapp-config';
import { EVMChainId } from '@webb-tools/dapp-types';
import {
  ChainType as ChainTypeEnum,
  calculateTypedChainId,
} from '@webb-tools/sdk-core';

// Default connection is ETH Goerli
export const getDefaultConnection = (chains: Record<number, Chain>) => {
  const defaultTypedChainId = calculateTypedChainId(
    ChainTypeEnum.EVM,
    EVMChainId.Goerli
  );
  return chains[defaultTypedChainId];
};
