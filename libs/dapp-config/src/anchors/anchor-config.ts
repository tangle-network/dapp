import { CurrencyRole, EVMChainId } from '@webb-tools/dapp-types';
import { ChainType, calculateTypedChainId } from '@webb-tools/sdk-core';

import { ApiConfig } from '../api-config';
import { CurrencyConfig } from '../currencies';

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 8508326,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 2920599,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 5611883,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 32139400,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 3771120,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.HermesLocalnet)]: {
    '0xc705034ded85e817b9E56C977E61A2098362898B': 0,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.AthenaLocalnet)]: {
    '0x91eB86019FD8D7c5a9E31143D422850A13F670A3': 0,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.DemeterLocalnet)]: {
    '0x6595b34ED0a270B10a586FC1EA22030A95386f1e': 0,
  },
};

export const getAnchorDeploymentBlockNumber = (
  chainIdType: number,
  contractAddress: string
): number | undefined => {
  return Object.entries(anchorDeploymentBlock[chainIdType]).find(
    (entry) => entry[0].toLowerCase() === contractAddress.toLowerCase()
  )?.[1];
};

/**
 * Get the address of the latest anchor deployed on the chain
 * @param typedChainId the chainIdType of the chain
 * @returns the latest anchor address for the chain
 */
export const getLatestAnchorAddress = (
  typedChainId: number
): string | undefined => {
  const deploymentsBlock = anchorDeploymentBlock[typedChainId];
  if (!deploymentsBlock) {
    return undefined;
  }

  const [address] = Object.entries(deploymentsBlock).reduce(
    ([prevAddress, prevBlockNumber], [address, blockNumber]) => {
      if (blockNumber > prevBlockNumber) {
        return [address, blockNumber];
      }
      return [prevAddress, prevBlockNumber];
    }
  );

  return address;
};

// Cache the anchor config
let anchorsConfig: ApiConfig['anchors'];

/**
 * Get the anchor config for the currencies
 * @param currencies the currency config which is fetched on-chain
 * @returns the anchor config which is indexed by currencyId
 */
export const getAnchorConfig = async (
  currencies: Record<number, CurrencyConfig>
): Promise<ApiConfig['anchors']> => {
  // If the anchor config is already calculated, return it
  if (anchorsConfig) {
    return anchorsConfig;
  }

  const anchors: ApiConfig['anchors'] = {};

  const fungibleCurrencies = Object.values(currencies).filter(
    (currency) => currency.role === CurrencyRole.Governable
  );

  fungibleCurrencies.forEach((currency) => {
    anchors[currency.id] = Array.from(currency.addresses.entries()).reduce(
      (acc, [typedChainId]) => {
        const address = getLatestAnchorAddress(typedChainId);
        if (address) {
          acc[typedChainId] = address;
        } else {
          console.error('No anchor address found for chain', typedChainId);
        }
        return acc;
      },
      {} as Record<number, string>
    );
  });

  anchorsConfig = anchors;

  return anchors;
};
