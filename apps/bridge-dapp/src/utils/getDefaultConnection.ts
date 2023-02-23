import {
  Chain,
  CurrencyConfig,
  getNativeCurrencyFromConfig,
} from '@webb-tools/dapp-config';
import { EVMChainId } from '@webb-tools/dapp-types';
import {
  ChainType as ChainTypeEnum,
  calculateTypedChainId,
} from '@webb-tools/sdk-core';
import { ChainType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';

// Default connection is ETH Goerli
export const getDefaultConnection = (
  chains: Record<number, Chain>,
  currencies: Record<number, CurrencyConfig>
) => {
  const sourceChains: ChainType[] = Object.values(chains).map((val) => {
    const typedChainId = calculateTypedChainId(val.chainType, val.chainId);
    const nativeCurrency = getNativeCurrencyFromConfig(
      currencies,
      typedChainId
    );
    if (!nativeCurrency) {
      console.error('No native currency found for chain', val.name);
    }

    return {
      name: val.name,
      symbol: nativeCurrency?.symbol ?? 'Unknown',
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
